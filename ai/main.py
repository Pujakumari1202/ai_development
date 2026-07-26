from graph.builder import build_graph
from mcp_client import append_message_via_mcp
from mcp_client import ensure_memory_tables_via_mcp
from mcp_client import load_session_memory_via_mcp
from mcp_client import save_active_order_context_via_mcp


GRAPH = build_graph()


def build_session_id(customer_identifier):
    normalized = customer_identifier.strip().lower().replace(" ", "-")
    return f"customer-{normalized}" if normalized else "customer-guest"


def load_session_state(session_id):
    ensure_memory_tables_via_mcp()
    memory_payload = load_session_memory_via_mcp(session_id)
    return {
        "conversation_history": memory_payload.get("history", []),
        "active_order_context": memory_payload.get("active_order_context", {}),
    }


def process_message(customer_identifier, user_input):
    session_id = build_session_id(customer_identifier)
    session_state = load_session_state(session_id)
    conversation_history = session_state["conversation_history"]
    active_order_context = session_state["active_order_context"]

    result = GRAPH.invoke(
        {
            "user_input": user_input,
            "conversation_history": conversation_history,
            "active_order_context": active_order_context,
        }
    )

    final_response = result.get("final_response", "")

    if result.get("need_clarification"):
        final_response = result.get(
            "clarification_question",
            "Please share a few more details so I can help.",
        )
    elif result.get("need_human"):
        final_response = result.get(
            "pending_human_message",
            "Your request needs manual review. Our team will get back to you shortly.",
        )

    conversation_history = [
        *conversation_history,
        {"role": "customer", "message": user_input},
        {"role": "assistant", "message": final_response},
    ][-12:]

    append_message_via_mcp(session_id, "customer", user_input)
    append_message_via_mcp(session_id, "assistant", final_response)

    merged_context = dict(active_order_context)
    merged_context.update(result.get("entities", {}))

    if result.get("turnaround_time"):
        merged_context["turnaround_time"] = result["turnaround_time"]

    if result.get("operation_summary"):
        merged_context["last_operation_summary"] = result["operation_summary"]

    if result.get("db_result"):
        merged_context["last_db_result"] = result["db_result"]

    save_active_order_context_via_mcp(session_id, merged_context)

    return {
        "session_id": session_id,
        "final_response": final_response,
        "operation_summary": result.get("operation_summary"),
        "turnaround_time": result.get("turnaround_time"),
        "raw_result": result,
    }




def process_whatsapp_message(sender, text):
    return process_message(sender, text)
