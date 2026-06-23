def clarification_node(state):

    try:

        answer = input(
            f"{state['clarification_question']}: "
        )

        # Exit option
        if answer.lower() in [
            "exit",
            "quit",
            "cancel"
        ]:

            return {
                **state,
                "final_response": "Request cancelled.",
                "need_clarification": False,
                "sql_query": ""
            }

        # Increment clarification count
        count = (
            state.get(
                "clarification_count",
                0
            ) + 1
        )

        # Escalate to human if too many clarification rounds
        if count >= 3:

            return {
                **state,
                "clarification_count": count,
                "need_human": True,
                "need_clarification": False
            }

        return {
            **state,

            "user_input": answer,
            "clarification_count": count,
            "need_clarification": False,
            "clarification_question": "",
            "sql_query": ""
        }

    except Exception as e:

        print(
            f"[ERROR] In clarification_node: {str(e)}"
        )

        import traceback
        traceback.print_exc()

        raise