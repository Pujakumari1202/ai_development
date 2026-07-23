from llm.azure_openai import client, deployment_name


def response_generator(state):
    try:

        if state.get("human_response"):

            return {
                **state,
                "final_response": state["human_response"]
            }

        mode = state.get("operation_mode", "database")
        conversation_history = state.get("conversation_history", [])
        active_order_context = state.get("active_order_context", {})

        prompt = f"""
        You are a procurement assistant.

        User Question:
        {state['user_input']}

        Operation Mode:
        {mode}

        Operation Summary:
        {state.get('operation_summary', '')}

        Requested Turnaround:
        {state.get('turnaround_time', '')}

        Active Order Context:
        {active_order_context}

        Recent Conversation:
        {conversation_history[-6:]}

        Database Result:
        {state['db_result']}

        Instructions:
        - Respond naturally based on the actual state and database result.
        - Do not hardcode a fixed script.
        - If suppliers are found, summarize the best options with price and turnaround.
        - If the user is negotiating or placing an order, explain the next operational step clearly.
        - If operation_mode is operations and there is no human_response yet, reply like an operations assistant taking the next action, for example asking for missing quantity, confirming supplier follow-up, or confirming the next order step.
        - Use active order context and recent conversation to make follow-up replies feel continuous.
        - If no results are found, say so.
        - Do not invent data that is not present in the database result or workflow state.
        - Keep the answer concise but conversational, similar to an operations assistant.
        """

        response = client.chat.completions.create(
            model=deployment_name,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        final_response = (
            response
            .choices[0]
            .message
            .content
            .strip()
        )

        if final_response.lower().startswith(
            "answer:"
        ):
            final_response = (
                final_response[7:].strip()
            )

        return {
            **state,
            "final_response": final_response
        }

    except Exception as e:
        print(
            f"[ERROR] In response_generator: {str(e)}"
        )

        import traceback
        traceback.print_exc()

        raise