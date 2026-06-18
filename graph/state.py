from typing import TypedDict

class AgentState(TypedDict):
    user_input: str
    sql_query: str
    need_clarification: bool
    clarification_question: str
    db_result: list
    final_response: str