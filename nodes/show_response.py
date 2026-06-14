def show_response(state):

    print("\nSHOW RESPONSE NODE")

    # CHAT RESPONSE
    if state.get("intent") == "CHAT":

        response = state.get(
            "response",
            "Hello! How can I help you?"
        )

        print(response)

        return {
            "response": response
        }

    # BOTH
    if state.get("product_data") and state.get("supplier_data"):

        response = f"""
    Product Details
    ---------------
    SKU : {state['product_data']['sku']}
    Name : {state['product_data']['product_name']}
    Price : {state['product_data']['price']}

    Supplier Details
    ----------------
    Supplier : {state['supplier_data']['supplier_name']}
    Contact : {state['supplier_data']['contact']}
    Email : {state['supplier_data']['email']}
    """

    # PRODUCT
    elif state.get("product_data"):

        response = f"""
    Product Details
    ---------------
    SKU : {state['product_data']['sku']}
    Name : {state['product_data']['product_name']}
    Price : {state['product_data']['price']}
    """

    # SUPPLIER
    elif state.get("supplier_data"):

        response = f"""
    Supplier Details
    ----------------
    Supplier : {state['supplier_data']['supplier_name']}
    Contact : {state['supplier_data']['contact']}
    Email : {state['supplier_data']['email']}
    """

    else:

        response = "No Data Found"

    print(response)

    return {
        "response": response
    }