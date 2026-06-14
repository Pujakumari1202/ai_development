from typing import TypedDict

class AgentState(TypedDict, total=False):
    user_input: str
    intent: str
    product_query: str
    supplier_query: str
    product_data: list
    supplier_data: list
    response: str