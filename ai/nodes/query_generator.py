from llm.azure_openai import client, deployment_name
from prompts.sql_prompt import SQL_PROMPT


def query_generator(state):
    try:
        user_input = state["user_input"]
        user_intent = state.get("user_intent", "unknown")
        entities = state.get("entities", {})
        operation_mode = state.get("operation_mode", "database")
        operation_summary = state.get("operation_summary", "")
        turnaround_time = state.get("turnaround_time", "")
        conversation_history = state.get("conversation_history", [])
        active_order_context = state.get("active_order_context", {})

        prompt = f"""
        {SQL_PROMPT}

        Workflow Context:
        - operation_mode: {operation_mode}
        - operation_summary: {operation_summary}
        - turnaround_time: {turnaround_time}

        Extracted Intent:
        {user_intent}

        Extracted Entities:
        {entities}

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
                    "content": "You are a PostgreSQL SQL Generator."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        output = response.choices[0].message.content.strip()

        # clarification path
        if output.startswith("NEED_CLARIFICATION"):

            question = output.replace(
                "NEED_CLARIFICATION:",
                ""
            ).strip()

            return {
                **state,

                "need_clarification": True,
                "clarification_question": question,
                "sql_query": ""
            }

        # normal path
        return {
            **state,

            "sql_query": output,
            "need_clarification": False,
            "clarification_question":""
        }

    except Exception as e:
        print(
            f"[ERROR] In query_generator: {str(e)}"
        )

        import traceback
        traceback.print_exc()

        raise