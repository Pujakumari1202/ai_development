from typing import TypedDict, List

class AgentState(TypedDict):
    user_input: str
    sql_query:str
    query_result: List
    response: str

