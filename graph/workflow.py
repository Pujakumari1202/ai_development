from langgraph.graph import StateGraph, END

from state import AgentState

from nodes.user_input import user_input_node
from nodes.generate_query import generate_query
from nodes.execute_query import execute_query
from nodes.supplier_node import supplier_node
from nodes.both_node import both_node
from nodes.chat_node import chat_node
from nodes.show_response import show_response


workflow = StateGraph(AgentState)

workflow.add_node("user_input", user_input_node)
workflow.add_node("generate_query", generate_query)
workflow.add_node("execute_query", execute_query)
workflow.add_node("supplier_node", supplier_node)
workflow.add_node("both_node", both_node)
workflow.add_node("chat_node", chat_node)
workflow.add_node("show_response", show_response)

workflow.set_entry_point("user_input")

workflow.add_edge("user_input", "generate_query")


def route_intent(state):

    intent = state["intent"]

    if intent == "PRODUCT":
        return "execute_query"

    elif intent == "SUPPLIER":
        return "supplier_node"

    elif intent == "BOTH":
        return "both_node"

    return "chat_node"


workflow.add_conditional_edges(
    "generate_query",
    route_intent,
    {
        "execute_query": "execute_query",
        "supplier_node": "supplier_node",
        "both_node": "both_node",
        "chat_node": "chat_node"
    }
)

workflow.add_edge("execute_query", "show_response")
workflow.add_edge("supplier_node", "show_response")
workflow.add_edge("both_node", "show_response")
workflow.add_edge("chat_node", "show_response")

workflow.add_edge("show_response", END)

app = workflow.compile()