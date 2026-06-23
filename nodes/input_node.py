def input_node(state):
    # Initialize missing state fields with defaults
    return {
        "user_input": state.get("user_input", ""),
        "conversation_history": state.get("conversation_history", []),
        "active_order_context": state.get("active_order_context", {}),
        "user_intent": state.get("user_intent", "unknown"),
        "entities": state.get("entities", {}),
        "sql_query": state.get("sql_query", ""),
        "need_clarification": state.get("need_clarification", False),
        "clarification_question": state.get("clarification_question", ""),
        "clarification_count": state.get("clarification_count", 0),
        "need_human": state.get("need_human", False),
        "operation_mode": state.get("operation_mode", "database"),
        "operation_action": state.get("operation_action", "query"),
        "operation_summary": state.get("operation_summary", ""),
        "turnaround_time": state.get("turnaround_time", ""),
        "pending_human_message": state.get("pending_human_message", ""),
        "human_response": state.get("human_response", ""),
        "db_result": state.get("db_result", []),
        "final_response": state.get("final_response", "")
    }