from langgraph.graph import StateGraph
from langgraph.graph import END

from graph.state import AgentState

from nodes.input_node import input_node
from nodes.intent_extraction import intent_extraction
from nodes.query_generator import query_generator
from nodes.clarification import clarification_node
from nodes.execute_query import execute_query
from nodes.response_generator import response_generator


def route(state):

    if state["need_clarification"]:
        return "clarification"

    return "execute"


def build_graph():

    graph = StateGraph(AgentState)

    graph.add_node(
        "input",
        input_node
    )

    graph.add_node(
        "intent_extraction",
        intent_extraction
    )

    graph.add_node(
        "query_generator",
        query_generator
    )

    graph.add_node(
        "clarification",
        clarification_node
    )

    graph.add_node(
        "execute",
        execute_query
    )

    graph.add_node(
        "response",
        response_generator
    )

    graph.set_entry_point(
        "input"
    )

    graph.add_edge(
        "input",
        "intent_extraction"
    )

    graph.add_edge(
        "intent_extraction",
        "query_generator"
    )

    graph.add_conditional_edges(
        "query_generator",
        route,
        {
            "clarification": "clarification",
            "execute": "execute"
        }
    )

    graph.add_edge(
        "clarification",
        "query_generator"
    )

    graph.add_edge(
        "execute",
        "response"
    )

    graph.add_edge(
        "response",
        END
    )

    return graph.compile()