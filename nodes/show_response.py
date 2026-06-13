def show_response(state):

    print("Show Response Node")

    if state.get("product_data") and state.get("supplier_data"):

        response = f"""
        Product Details
        ---------------
        SKU : {state['product_data']['sku']}
        Name : {state['product_data']['name']}
        Price : {state['product_data']['price']}

        Supplier Details
        ----------------
        Supplier : {state['supplier_data']['supplier']}
        Contact : {state['supplier_data']['contact']}
        """

    elif state.get("product_data"):

        response = f"""
        Product Details
        ---------------
        SKU : {state['product_data']['sku']}
        Name : {state['product_data']['name']}
        Price : {state['product_data']['price']}
        """

    elif state.get("supplier_data"):

        response = f"""
        Supplier Details
        ----------------
        Supplier : {state['supplier_data']['supplier']}
        Contact : {state['supplier_data']['contact']}
        Email : {state['supplier_data']['email']}
        """

    else:
        response = state.get("response", "No Data Found")

    print(response)

    return {
        "response": response
    }