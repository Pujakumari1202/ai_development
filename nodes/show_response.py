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

        product = state["product_data"][0]
        supplier = state["supplier_data"][0]

        response = f"""
        Product Details
        ---------------
        SKU : {product['sku']}
        Name : {product['product_name']}
        Price : {product['price']}

        Supplier Details
        ----------------
        Supplier : {supplier['supplier_name']}
        Contact : {supplier['contact']}
        Email : {supplier['email']}
        """

    # PRODUCT
    elif state.get("product_data"):

        product = state["product_data"][0]

        response = f"""
        Product Details
        ---------------
        SKU : {product['sku']}
        Name : {product['product_name']}
        Price : {product['price']}
        """

    # SUPPLIER
    elif state.get("supplier_data"):

        supplier = state["supplier_data"][0]

        response = f"""
        Supplier Details
        ----------------
        Supplier : {supplier['supplier_name']}
        Contact : {supplier['contact']}
        Email : {supplier['email']}
        """

    else:

        response = "No Data Found"

    print(response)

    return {
        "response": response
    }