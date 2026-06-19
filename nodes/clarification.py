def clarification_node(state):
    try:
        answer = input("Answer: ")

        updated_query = (
            state["user_input"]
            + " "
            + answer
        )

        return {
            "user_input": updated_query,
            "user_intent": state.get("user_intent", "unknown"),
            "entities": state.get("entities", {}),
            "need_clarification": False,
            "clarification_question": "",
            "sql_query": "",
            "db_result": [],
            "final_response": ""
        }
    except Exception as e:
        print(f"[ERROR] In clarification_node: {str(e)}")
        import traceback
        traceback.print_exc()
        raise