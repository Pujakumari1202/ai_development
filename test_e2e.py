from graph.builder import build_graph

print("Starting end-to-end test...")
print("=" * 60)

graph = build_graph()
result = graph.invoke({'user_input': 'I need Luisine Bread tomorrow'})

print("\n✅ SUCCESS - Full workflow completed!")
print("=" * 60)
print("\nGenerated SQL:")
print(result['sql_query'])
print(f"\nDatabase Results: {len(result['db_result'])} rows found")
print("\nFinal Response:")
print(result['final_response'])
print("\n" + "=" * 60)
