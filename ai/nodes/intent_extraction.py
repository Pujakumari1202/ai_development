import json

from llm.azure_openai import client, deployment_name
from prompts.intent_prompt import INTENT_PROMPT


def _fallback_intent(user_input):
    normalized = user_input.lower()
    if "cheap" in normalized or "budget" in normalized:
        return "show_cheap_products", {"price_range": "cheap"}
    if "show" in normalized and "product" in normalized:
        return "show_products", {}
    if "id" in normalized:
        return "show_product_details", {"product_name": normalized}
    return "find_product_by_name", {"product_name": user_input}


def intent_extraction(state):
    try:
        user_input = state["user_input"]
        conversation_history = state.get("conversation_history", [])
        active_order_context = state.get("active_order_context", {})

        prompt = f"""
            {INTENT_PROMPT}

            Conversation History:
            {conversation_history[-6:]}

            Active Order Context:
            {active_order_context}

            User Request:
            {user_input}
            """

        response = client.chat.completions.create(
            model=deployment_name,
            messages=[
                {
                    "role": "system",
                    "content": "You are a JSON intent and entity extractor. Return only valid JSON."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        output = response.choices[0].message.content.strip()

        if output.startswith("{"):
            parsed = json.loads(output)
            intent = parsed.get("intent", "unknown")
            entities = parsed.get("entities", {}) or {}
        else:
            intent = "unknown"
            entities = {}

        return {
            **state,
            "user_intent": intent,
            "entities": entities,
        }
    except Exception:
        intent, entities = _fallback_intent(state.get("user_input", ""))
        return {
            **state,
            "user_intent": intent,
            "entities": entities,
        }