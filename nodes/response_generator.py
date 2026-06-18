from llm.azure_openai import client, deployment_name


def response_generator(state):
    try:
        prompt = f"""
User Question:
{state['user_input']}

Database Result:
{state['db_result']}

Generate a concise natural language response.
"""
        
        response = client.chat.completions.create(
            model=deployment_name,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        final_response = response.choices[0].message.content
        
        return {
            "final_response": final_response,
            "need_clarification": False,
            "clarification_question": "",
            "sql_query": state.get("sql_query", ""),
            "db_result": state.get("db_result", [])
        }
    except Exception as e:
        print(f"[ERROR] In response_generator: {str(e)}")
        import traceback
        traceback.print_exc()
        raise