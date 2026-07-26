from graph.builder import build_graph
from mcp_client import append_message_via_mcp
from mcp_client import ensure_memory_tables_via_mcp
from mcp_client import load_session_memory_via_mcp
from mcp_client import MCP_SERVER_URL
from mcp_client import save_active_order_context_via_mcp


def build_session_id(customer_identifier):
    normalized = customer_identifier.strip().lower().replace(" ", "-")
    return f"customer-{normalized}" if normalized else "customer-guest"


def run_cli():
    graph = build_graph()
    customer_identifier = input("Customer name or phone: ").strip() or "guest"
    session_id = build_session_id(customer_identifier)

    print("\nLoading conversation memory...")
    try:
        ensure_memory_tables_via_mcp()
        memory_payload = load_session_memory_via_mcp(session_id)
        conversation_history = memory_payload.get("history", [])
        active_order_context = memory_payload.get("active_order_context", {})
    except Exception as exc:
        print(f"Unable to load conversation memory: {exc}")
        print("Check that the MCP server is running and can reach the database.")
        print(f"Expected MCP endpoint: {MCP_SERVER_URL}/call_tool")
        return

    print(f"Conversation started for {customer_identifier}.")
    print(f"Using MCP server: {MCP_SERVER_URL}")
    #print("Conversation memory is persisted through MCP.")
    print("Type 'exit' to close the chat.")

    while True:
        user_input = input("\nAsk Question: ")

        if user_input.lower() == "exit":
            break

        result = graph.invoke(
            {
                "user_input": user_input,
                "conversation_history": conversation_history,
                "active_order_context": active_order_context,
            }
        )

        conversation_history = [
            *conversation_history,
            {"role": "customer", "message": user_input},
            {"role": "assistant", "message": result.get("final_response", "")},
        ][-12:]

        append_message_via_mcp(session_id, "customer", user_input)
        append_message_via_mcp(session_id, "assistant", result.get("final_response", ""))

        merged_context = dict(active_order_context)
        merged_context.update(result.get("entities", {}))

        if result.get("turnaround_time"):
            merged_context["turnaround_time"] = result["turnaround_time"]

        if result.get("operation_summary"):
            merged_context["last_operation_summary"] = result["operation_summary"]

        if result.get("db_result"):
            merged_context["last_db_result"] = result["db_result"]

        active_order_context = merged_context
        save_active_order_context_via_mcp(session_id, active_order_context)

        if result.get("operation_summary"):
            print("\nWorkflow:")
            print(result["operation_summary"])

        if result.get("turnaround_time"):
            print("\nTurnaround:")
            print(result["turnaround_time"])

        print("\nAnswer:")
        print(result["final_response"])


if __name__ == "__main__":
    run_cli()