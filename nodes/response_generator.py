from llm.azure_openai import client, deployment_name


def response_generator(state):
    try:
        prompt = f"""You are a helpful assistant. Based on the user's question and database results, provide ONE clear, concise answer.

User Question: {state['user_input']}

Database Result: {state['db_result']}

Instructions:
- Provide only ONE answer
- Be concise and natural
- If no results, suggest next steps
- Do NOT repeat or generate multiple responses
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

        final_response = response.choices[0].message.content.strip()
        
        # Remove any "Answer:" prefix if present
        if final_response.lower().startswith("answer:"):
            final_response = final_response[7:].strip()
        
        return {
            "user_input": state.get("user_input", ""),
            "user_intent": state.get("user_intent", "unknown"),
            "entities": state.get("entities", {}),
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