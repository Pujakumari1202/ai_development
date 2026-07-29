import json

from llm.azure_openai import client, deployment_name


def _build_pending_human_message(state, parsed):
    if parsed.get("pending_human_message"):
        return parsed["pending_human_message"]

    entities = state.get("entities", {})
    active_order_context = state.get("active_order_context", {})

    product_name = entities.get("product_name") or active_order_context.get("product_name") or "the requested product"
    quantity = entities.get("quantity") or active_order_context.get("quantity")
    supplier_name = entities.get("supplier_name") or active_order_context.get("supplier_name")
    turnaround_time = parsed.get("turnaround_time") or active_order_context.get("turnaround_time")
    action = parsed.get("operation_action", "")

    if action == "human_handoff":
        if quantity and supplier_name:
            return f"Customer wants {quantity} pieces of {product_name}. Please check with {supplier_name} for price or order confirmation."
        if quantity:
            return f"Customer wants {quantity} pieces of {product_name}. Please check with the supplier for price or order confirmation."
        if turnaround_time:
            return f"Customer needs {product_name} by {turnaround_time}. Please check with the supplier for availability or pricing."
        return f"Please check with the supplier about {product_name}."

    return ""


def _should_auto_contact_supplier(state, parsed):
    if parsed.get("operation_action") != "human_handoff":
        return False

    user_input = (state.get("user_input") or "").lower()
    operation_summary = (parsed.get("operation_summary") or "").lower()

    trigger_phrases = [
        "check with supplier",
        "contact supplier",
        "connect with supplier",
        "ask supplier",
        "lower price",
        "cheap price",
        "best price",
        "negotiate",
        "discount",
        "confirm availability",
        "can he give",
        "can she give",
        "can he send",
        "can she send",
        "discuss with",
    ]

    return any(phrase in user_input for phrase in trigger_phrases) or "supplier" in operation_summary


def _fallback_decision(user_input):
    normalized = user_input.lower()

    if any(keyword in normalized for keyword in ["place order", "send message", "supplier", "discount", "lower price", "bulk"]):
        return {
            "operation_mode": "operations",
            "operation_action": "human_handoff",
            "need_human": True,
            "need_clarification": False,
            "clarification_question": "",
            "operation_summary": "Supplier negotiation or order placement needs a human operator.",
            "turnaround_time": "",
            "pending_human_message": user_input,
        }

    return {
        "operation_mode": "database",
        "operation_action": "query",
        "need_human": False,
        "need_clarification": False,
        "clarification_question": "",
        "operation_summary": "Standard database lookup.",
        "turnaround_time": "",
        "pending_human_message": "",
    }


def human_decision_node(state):
    user_input = state["user_input"]
    conversation_history = state.get("conversation_history", [])
    active_order_context = state.get("active_order_context", {})

    prompt = f"""
You are routing a procurement assistant conversation.

Return only valid JSON with this shape:
{{
  "operation_mode": "database" | "operations",
  "operation_action": "query" | "clarify" | "human_handoff",
  "need_human": true | false,
  "need_clarification": true | false,
  "clarification_question": "string",
  "operation_summary": "short summary",
  "turnaround_time": "string",
  "pending_human_message": "message for operations team"
}}

Use "database/query" for normal read-only questions.
Use "operations/clarify" when order details are missing.
Use "operations/human_handoff" when supplier negotiation, discount approval, supplier contact, or order placement is needed.
If the user mentions urgency like tomorrow or 1 day, capture that in turnaround_time.
Use the conversation history and active order context to resolve follow-up messages like:
- lower price
- check with supplier
- place the order
- 200pc

Conversation History:
{conversation_history[-6:]}

Active Order Context:
{active_order_context}

User request:
{user_input}
"""

    try:
        response = client.chat.completions.create(
            model=deployment_name,
            messages=[
                {
                    "role": "system",
                    "content": "You are a procurement workflow router. Return only valid JSON."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        parsed = json.loads(response.choices[0].message.content.strip())
    except Exception:
        parsed = _fallback_decision(user_input)

    return {
        **state,
        "operation_mode": parsed.get("operation_mode", "database"),
        "operation_action": parsed.get("operation_action", "query"),
        "need_human": parsed.get("need_human", False),
        "need_clarification": parsed.get("need_clarification", False),
        "clarification_question": parsed.get("clarification_question", ""),
        "operation_summary": parsed.get("operation_summary", ""),
        "turnaround_time": parsed.get("turnaround_time", ""),
        "pending_human_message": _build_pending_human_message(state, parsed),
        "auto_contact_supplier": _should_auto_contact_supplier(state, parsed),
    }