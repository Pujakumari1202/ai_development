from graph.workflow import app

while True:

    user_input = input("\nUser: ")

    result = app.invoke(
        {
            "user_input": user_input
        }
    )

    print("\nBot:")
    print(result["response"])