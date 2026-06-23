def human_review_node(state):
    print("\nHuman operations step needed")
    print(f"Customer request: {state['user_input']}")

    if state.get("operation_summary"):
        print(f"Workflow summary: {state['operation_summary']}")

    if state.get("turnaround_time"):
        print(f"Requested turnaround: {state['turnaround_time']}")

    if state.get("pending_human_message"):
        print(f"Suggested operator message: {state['pending_human_message']}")

    response = input("Operations update: ")

    return {
        **state,
        "human_response": response,
        "final_response": response,
        "need_human": False,
    }