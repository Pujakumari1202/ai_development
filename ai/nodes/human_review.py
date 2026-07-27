def _build_supplier_contact_result(state):
    db_result = state.get("db_result") or []
    entities = state.get("entities", {})
    active_order_context = state.get("active_order_context", {})

    if not db_result:
        return {}

    supplier = db_result[0]
    quantity = entities.get("quantity") or active_order_context.get("quantity") or 0
    listed_price = supplier.get("price")
    total_price = round(float(listed_price) * quantity, 2) if quantity and listed_price is not None else None

    return {
        "supplier_name": supplier.get("supplier_name"),
        "phone_number": supplier.get("phone_number"),
        "product_name": supplier.get("product_name"),
        "quantity": quantity,
        "listed_price": listed_price,
        "confirmed_price": None,
        "confirmed_total": None,
        "listed_total": total_price,
        "delivery_eta": supplier.get("turnaround_time") or state.get("turnaround_time") or "not confirmed",
        "status": "pending_supplier_reply",
        "supplier_reply": "",
    }


def human_review_node(state):
    supplier_contact_result = _build_supplier_contact_result(state)
    if supplier_contact_result:
        return {
            **state,
            "supplier_contact_result": supplier_contact_result,
            "human_response": "",
            "need_human": False,
        }

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