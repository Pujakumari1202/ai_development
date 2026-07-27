from llm.azure_openai import client, deployment_name


def _build_supplier_followup_response(state):
    if state.get("operation_mode") != "operations":
        return ""

    user_input = (state.get("user_input") or "").lower()
    operation_summary = (state.get("operation_summary") or "").lower()
    db_result = state.get("db_result") or []

    needs_supplier_followup = any(
        phrase in user_input
        for phrase in ["check with", "contact", "call", "supplier", "send tomorrow", "can send tomorrow"]
    ) or "supplier" in operation_summary

    if not needs_supplier_followup or not isinstance(db_result, list) or not db_result:
        return ""

    supplier = db_result[0]
    supplier_name = supplier.get("supplier_name") or "the supplier"
    phone_number = supplier.get("phone_number") or "not available"
    product_name = supplier.get("product_name") or state.get("entities", {}).get("product_name") or "the requested product"
    price = supplier.get("price")
    turnaround_time = supplier.get("turnaround_time") or state.get("turnaround_time") or "not confirmed"

    quantity = state.get("entities", {}).get("quantity")
    quantity_text = f" for {quantity} units" if quantity else ""
    price_text = f" Current listed price is QAR {price}." if price is not None else ""

    return (
        f"I found {supplier_name} in the supplier table for {product_name}{quantity_text}. "
        f"Use supplier contact {phone_number} for the follow-up.{price_text} "
        f"Listed turnaround is {turnaround_time}. "
        "I will treat this as a supplier-contact action and report back with the supplier confirmation format rather than asking you to contact them yourself."
    )


def response_generator(state):
    try:

        supplier_contact_result = state.get("supplier_contact_result") or {}
        if supplier_contact_result:
            supplier_name = supplier_contact_result.get("supplier_name") or "Supplier"
            supplier_reply = supplier_contact_result.get("supplier_reply") or "Supplier confirmed availability."
            confirmed_price = supplier_contact_result.get("confirmed_price")
            confirmed_total = supplier_contact_result.get("confirmed_total")
            delivery_eta = supplier_contact_result.get("delivery_eta") or "not confirmed"

            price_text = f" Confirmed price: QAR {confirmed_price} each." if confirmed_price is not None else ""
            total_text = f" Total: QAR {confirmed_total}." if confirmed_total is not None else ""

            return {
                **state,
                "final_response": f"{supplier_name} replied: {supplier_reply}.{price_text}{total_text} Delivery ETA: {delivery_eta}."
            }

        supplier_followup_response = _build_supplier_followup_response(state)
        if supplier_followup_response:
            return {
                **state,
                "final_response": supplier_followup_response
            }

        if state.get("human_response"):

            return {
                **state,
                "final_response": state["human_response"]
            }

        mode = state.get("operation_mode", "database")
        conversation_history = state.get("conversation_history", [])
        active_order_context = state.get("active_order_context", {})

        prompt = f"""
        You are a procurement assistant.

        User Question:
        {state['user_input']}

        Operation Mode:
        {mode}

        Operation Summary:
        {state.get('operation_summary', '')}

        Requested Turnaround:
        {state.get('turnaround_time', '')}

        Active Order Context:
        {active_order_context}

        Recent Conversation:
        {conversation_history[-6:]}

        Database Result:
        {state['db_result']}

        Instructions:
        - Respond naturally based on the actual state and database result.
        - Do not hardcode a fixed script.
        - If suppliers are found, summarize the best options with price and turnaround.
        - If the user is negotiating or placing an order, explain the next operational step clearly.
        - If operation_mode is operations and there is no human_response yet, reply like an operations assistant taking the next action, for example asking for missing quantity, confirming supplier follow-up, or confirming the next order step.
        - Use active order context and recent conversation to make follow-up replies feel continuous.
        - If no results are found, say so.
        - Do not invent data that is not present in the database result or workflow state.
        - Keep the answer concise but conversational, similar to an operations assistant.
        """

        response = client.chat.completions.create(
            model=deployment_name,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        final_response = (
            response
            .choices[0]
            .message
            .content
            .strip()
        )

        if final_response.lower().startswith(
            "answer:"
        ):
            final_response = (
                final_response[7:].strip()
            )

        return {
            **state,
            "final_response": final_response
        }

    except Exception as e:
        print(
            f"[ERROR] In response_generator: {str(e)}"
        )

        import traceback
        traceback.print_exc()

        raise