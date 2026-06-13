def execute_query(state):

    print("Execute Product Query Node")

    product_data = {
        "sku": "SKU123",
        "name": "Wireless Mouse",
        "price": 250
    }

    return {
        "product_data": product_data
    }