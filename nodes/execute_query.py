def execute_query(state):
    print("Excute Query Node")

    sql=state["sql_query"]

    print(sql)

    result = [
        {
            "id":1,
            "sku":"5",
            "product_name":"QBake Bread",
            "price":25
        }
    ]

    return {
        "query_result":result
    }