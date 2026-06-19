from db.postgres import run_query


def execute_query(state):
    try:
        sql_query = state["sql_query"]
        
        data = run_query(sql_query)

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
        print(f"[ERROR] In execute_query: {str(e)}")
        import traceback
        traceback.print_exc()
        raise