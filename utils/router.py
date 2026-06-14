def route_query(state):

    print("\nROUTER NODE")

    intent = state.get("intent", "CHAT")

    print(f"Intent: {intent}")

    return intent