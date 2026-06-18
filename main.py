from graph.builder import build_graph

graph = build_graph()

while True:

    user_input = input(
        "\nAsk Question: "
    )

    if user_input.lower() == "exit":
        break

    result = graph.invoke(
        {
            "user_input": user_input
        }
    )

    print("\nGenerated SQL:")
    print(result["sql_query"])

    print("\nAnswer:")
    print(result["final_response"])