from llm.azure_openai import client, deployment_name
from prompts.sql_prompt import SQL_PROMPT


def query_generator(state):
    try:
        user_input = state["user_input"]
        user_intent = state.get("user_intent", "unknown")
        entities = state.get("entities", {})

        prompt = f"""
    {SQL_PROMPT}

    Intent: {user_intent}
    Entities: {entities}

    User Request:
    {user_input}
    """

        response = client.chat.completions.create(
            model=deployment_name,
            messages=[
                {
                    "role": "system",
                    "content": "You are a PostgreSQL SQL Generator."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        output = response.choices[0].message.content.strip()

        if output.startswith("NEED_CLARIFICATION"):

            question = output.replace(
                "NEED_CLARIFICATION:",
                ""
            ).strip()

            return {
                "need_clarification": True,
                "clarification_question": question,
                "sql_query": "",
                "db_result": [],
                "final_response": ""
            }

        return {
            "sql_query": output,
            "need_clarification": False,
            "db_result": [],
            "final_response": ""
        }
    except Exception as e:
        print(f"[ERROR] In query_generator: {str(e)}")
        import traceback
        traceback.print_exc()
        raise