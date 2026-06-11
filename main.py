from graph import graph

user_question = input("Ask: ")

result = graph.invoke(
    {
        "user_input": user_question
    }
)


print("\nFinal Response:")
print(result["response"])