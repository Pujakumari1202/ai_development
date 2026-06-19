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

        prompt = f"""
            {INTENT_PROMPT}

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
            "user_intent": intent,
            "entities": entities,
            "sql_query": state.get("sql_query", ""),
            "need_clarification": state.get("need_clarification", False),
            "clarification_question": state.get("clarification_question", ""),
            "db_result": state.get("db_result", []),
            "final_response": state.get("final_response", "")
        }
    except Exception:
        intent, entities = _fallback_intent(state.get("user_input", ""))
        return {
            "user_intent": intent,
            "entities": entities,
            "sql_query": state.get("sql_query", ""),
            "need_clarification": state.get("need_clarification", False),
            "clarification_question": state.get("clarification_question", ""),
            "db_result": state.get("db_result", []),
            "final_response": state.get("final_response", "")
        }