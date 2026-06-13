from typing import TypedDict

class AgentState(TypedDict, total=False):
    user_input: str
    intent: str
    sql_query: str
    product_data: dict
    supplier_data: dict
    response: str