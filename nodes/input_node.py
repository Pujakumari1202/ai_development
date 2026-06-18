def input_node(state):
    # Initialize missing state fields with defaults
    return {
        "user_input": state.get("user_input", ""),
        "sql_query": state.get("sql_query", ""),
        "need_clarification": state.get("need_clarification", False),
        "clarification_question": state.get("clarification_question", ""),
        "db_result": state.get("db_result", []),
        "final_response": state.get("final_response", "")
    }