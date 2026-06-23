from langgraph.graph import StateGraph
from langgraph.graph import END

from graph.state import AgentState

from nodes.input_node import input_node
from nodes.intent_extraction import intent_extraction
from nodes.query_generator import query_generator
from nodes.clarification import clarification_node
from nodes.execute_query import execute_query
from nodes.response_generator import response_generator
from nodes.human_decision import human_decision_node
from nodes.human_review import human_review_node


def human_route(state):
    if state["need_human"]:
        return "human_review"

    if state["need_clarification"]:
        return "clarification"

    return "execute"


def decision_route(state):
    if state["need_human"]:
        return "human_review"

    if state["need_clarification"]:
        return "clarification"

    return "human_decision"


def build_graph():

    graph = StateGraph(AgentState)

    # Add nodes

    graph.add_node(
        "input",
        input_node
    )

    graph.add_node(
        "intent_extraction",
        intent_extraction
    )

    graph.add_node(
        "human_decision",
        human_decision_node
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
        "human_review",
        human_review_node
    )

    graph.add_node(
        "execute",
        execute_query
    )

    graph.add_node(
        "response",
        response_generator
    )


    # Entry point

    graph.set_entry_point(
        "input"
    )


    # Flow

    graph.add_edge(
        "input",
        "intent_extraction"
    )

    graph.add_conditional_edges(
    "intent_extraction",
    decision_route,
    {
        "human_review":"human_review",
        "clarification":"clarification",
        "human_decision":"human_decision"
    }
    )

    graph.add_edge(
        "human_decision",
        "query_generator"
    )

    graph.add_conditional_edges(
    "query_generator",
    human_route,
    {
        "clarification":"clarification",
        "human_review":"human_review",
        "execute":"execute"
    }
    )

    # Loop clarification back

    graph.add_edge(
        "clarification",
        "query_generator"
    )


    # Human review response

    graph.add_edge(
        "human_review",
        "response"
    )


    # Query execution response

    graph.add_edge(
        "execute",
        "response"
    )


    graph.add_edge(
        "response",
        END
    )

    return graph.compile()