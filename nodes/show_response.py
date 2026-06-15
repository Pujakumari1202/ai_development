# def show_response(state):

#     print("\nSHOW RESPONSE NODE")

#     # CHAT RESPONSE
#     if state.get("intent") == "CHAT":

#         response = state.get(
#             "response",
#             "Hello! How can I help you?"
#         )

#         print(response)

#         return {
#             "response": response
#         }

#     # BOTH
#     if state.get("product_data") and state.get("supplier_data"):

#         product = state["product_data"][0]
#         supplier = state["supplier_data"][0]

#         response = f"""
#         Product Details
#         ---------------
#         SKU : {product['sku']}
#         Name : {product['product_name']}
#         Price : {product['price']}

#         Supplier Details
#         ----------------
#         Supplier : {supplier['supplier_name']}
#         Contact : {supplier['contact']}
#         Email : {supplier['email']}
#         """

#     # PRODUCT
#     elif state.get("product_data"):

#         product = state["product_data"][0]

#         response = f"""
#         Product Details
#         ---------------
#         SKU : {product['sku']}
#         Name : {product['product_name']}
#         Price : {product['price']}
#         """

#     # SUPPLIER
#     elif state.get("supplier_data"):

#         supplier = state["supplier_data"][0]

#         response = f"""
#         Supplier Details
#         ----------------
#         Supplier : {supplier['supplier_name']}
#         Contact : {supplier['contact']}
#         Email : {supplier['email']}
#         """

#     else:

#         response = "No Data Found"

#     return {
#         "response": response
#     }


def show_response(state):

    print("\nSHOW RESPONSE NODE")

    # CHAT
    if state.get("intent") == "CHAT":

        return {
            "response": state.get(
                "response",
                "Hello! How can I help you today?"
            )
        }

    # BOTH
    if state.get("product_data") and state.get("supplier_data"):

        product = state["product_data"][0]
        supplier = state["supplier_data"][0]

        response = (
            f"I found the details for SKU {product['sku']}.\n\n"
            f"Product Name: {product['product_name']}\n"
            f"Price: ₹{product['price']}\n\n"
            f"Supplier: {supplier['supplier_name']}\n"
            f"Contact: {supplier['contact']}\n"
            f"Email: {supplier['email']}"
        )

    # PRODUCT
    elif state.get("product_data"):

        product = state["product_data"][0]

        response = (
            f"I found the product details.\n\n"
            f"Product Name: {product['product_name']}\n"
            f"SKU: {product['sku']}\n"
            f"Price: ₹{product['price']}"
        )

    # SUPPLIER
    elif state.get("supplier_data"):

        supplier = state["supplier_data"][0]

        response = (
            f"I found the supplier details.\n\n"
            f"Supplier Name: {supplier['supplier_name']}\n"
            f"Contact: {supplier['contact']}\n"
            f"Email: {supplier['email']}"
        )

    else:

        response = (
            "Sorry, I couldn't find any matching records."
        )


    return {
        "response": response
    }