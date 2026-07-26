from graph.builder import build_graph
from mcp_client import MCP_SERVER_URL
from memory.conversation_memory import append_message
from memory.conversation_memory import ensure_memory_tables
from memory.conversation_memory import ensure_procurement_tables
from memory.conversation_memory import load_session_memory
from memory.conversation_memory import save_active_order_context


def build_session_id(customer_identifier):
    normalized = customer_identifier.strip().lower().replace(" ", "-")
    return f"customer-{normalized}" if normalized else "customer-guest"


def run_cli():
    graph = build_graph()
    customer_identifier = input("Customer name or phone: ").strip() or "guest"
    session_id = build_session_id(customer_identifier)

    print("\nLoading conversation memory...")
    try:
        ensure_memory_tables()
        ensure_procurement_tables()
        conversation_history, active_order_context = load_session_memory(session_id)
    except Exception as exc:
        print(f"Unable to load conversation memory: {exc}")
        print("Check your PostgreSQL connection settings and try again.")
        print("Expected environment values: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD")
        print("If you are using docker-compose.yml, start PostgreSQL first and match these values in your .env file.")
        return

    print(f"Conversation started for {customer_identifier}.")
    #print(f"Using MCP server: {MCP_SERVER_URL}")
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

        append_message(session_id, "customer", user_input)
        append_message(session_id, "assistant", result.get("final_response", ""))

        merged_context = dict(active_order_context)
        merged_context.update(result.get("entities", {}))

        if result.get("turnaround_time"):
            merged_context["turnaround_time"] = result["turnaround_time"]

        if result.get("operation_summary"):
            merged_context["last_operation_summary"] = result["operation_summary"]

        if result.get("db_result"):
            merged_context["last_db_result"] = result["db_result"]

        active_order_context = merged_context
        save_active_order_context(session_id, active_order_context)

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