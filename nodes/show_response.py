def show_response(state):

    print("Show Reponse Node")

    result =state["query_result"]

    if not result:
        return {
            "response":"No Products Found"
        }

    product = result[0]

    response = f"""
    Product:{product['product_name']}
    SKU:{product['sku']}
    Price: ${product['price']}
    """
    return {
        "response":response
    }

