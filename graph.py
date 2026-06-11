from langgraph.graph import StateGraph, END
from state import AgentState

from nodes.user_input import user_input_node
from nodes.generate_query import generate_query
from nodes.execute_query import execute_query
from nodes.show_response import show_response

workflow = StateGraph(AgentState)

workflow.add_node("user_input",user_input_node)
workflow.add_node("generate_query",generate_query)
workflow.add_node("execute_query",execute_query)
workflow.add_node("show_response",show_response)

workflow.set_entry_point("user_input")

workflow.add_edge("user_input","generate_query")
workflow.add_edge("generate_query","execute_query")
workflow.add_edge("execute_query","show_response")
workflow.add_edge("show_response",END)


graph = workflow.compile()
