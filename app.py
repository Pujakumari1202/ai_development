from graph.workflow import app

while True:

    user_input = input("\nUser: ")

    if user_input.lower() in ["exit", "quit"]:
        print("Goodbye!")
        break

    try:

        result = app.invoke(
            {
                "user_input": user_input
            }
        )

        print("\nBot:")
        print(result.get("response", "No response generated"))

    except Exception as e:

        print(f"\nError: {e}")