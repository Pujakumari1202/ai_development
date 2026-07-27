from mcp_client import find_product_suppliers_via_mcp
from mcp_client import get_supplier_options_via_mcp
from mcp_client import run_query_via_mcp


def execute_query(state):
    try:
        sql_query = state["sql_query"]
        entities = state.get("entities", {})
        user_intent = state.get("user_intent", "unknown")
        active_order_context = state.get("active_order_context", {})

        product_name = entities.get("product_name") or active_order_context.get("product_name")
        required_by = entities.get("required_by") or active_order_context.get("required_by") or active_order_context.get("turnaround_time", "")

        if (
            user_intent in {"find_products", "compare_suppliers", "check_turnaround"}
            or (
                state.get("operation_mode") == "operations"
                and product_name
            )
        ) and product_name:
            if required_by:
                data = get_supplier_options_via_mcp(product_name, required_by)
            else:
                data = find_product_suppliers_via_mcp(product_name)
        else:
            data = run_query_via_mcp(sql_query)

        return {
            **state,
            "user_input": state.get("user_input", ""),
            "user_intent": user_intent,
            "entities": entities,
            "sql_query": sql_query,
            "db_result": data,
            "need_clarification": False,
            "clarification_question": "",
            "final_response": ""
        }
    except Exception as e:
        print(f"[ERROR] Query execution failed: {str(e)}")
        raise