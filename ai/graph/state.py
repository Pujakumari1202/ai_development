from typing import TypedDict

class AgentState(TypedDict):
    user_input: str
    conversation_history: list
    active_order_context: dict
    user_intent: str
    entities: dict
    sql_query: str
    need_clarification: bool
    clarification_question: str
    clarification_count: int
    need_human: bool
    operation_mode: str
    operation_action: str
    operation_summary: str
    turnaround_time: str
    pending_human_message: str
    human_response: str
    auto_contact_supplier: bool
    supplier_contact_result: dict
    db_result: list
    final_response: str