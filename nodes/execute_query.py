from mcp_client import run_query_via_mcp


def execute_query(state):
    try:
        sql_query = state["sql_query"]
        
        data = run_query_via_mcp(sql_query)

        return {
            "user_input": state.get("user_input", ""),
            "user_intent": state.get("user_intent", "unknown"),
            "entities": state.get("entities", {}),
            "sql_query": sql_query,
            "db_result": data,
            "need_clarification": False,
            "clarification_question": "",
            "final_response": ""
        }
    except Exception as e:
        print(f"[ERROR] Query execution failed: {str(e)}")
        raise