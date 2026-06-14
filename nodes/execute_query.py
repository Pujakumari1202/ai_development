def execute_query(state):

    print("\nEXECUTE QUERY NODE")

    intent = state.get("intent")

    if intent == "PRODUCT":

        product_data = {
            "sku": "SKU123",
            "product_name": "Wireless Mouse",
            "description": "Bluetooth Wireless Mouse",
            "price": 250
        }

        return {
            "product_data": product_data
        }

    elif intent == "SUPPLIER":

        supplier_data = {
            "supplier_name": "ABC Pvt Ltd",
            "contact": "9876543210",
            "email": "abc@gmail.com"
        }

        return {
            "supplier_data": supplier_data
        }

    elif intent == "BOTH":

        product_data = {
            "sku": "SKU123",
            "product_name": "Wireless Mouse",
            "description": "Bluetooth Wireless Mouse",
            "price": 250
        }

        supplier_data = {
            "supplier_name": "ABC Pvt Ltd",
            "contact": "9876543210",
            "email": "abc@gmail.com"
        }

        return {
            "product_data": product_data,
            "supplier_data": supplier_data
        }

    return {}


## replce this with mcp
# result = client.call_tool(
#     "execute_product_query",
#     {
#         "query": state["product_query"]
#     }
# )