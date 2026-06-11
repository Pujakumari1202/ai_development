import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    base_url=os.getenv("Azure_OPENAI_ENDPOINT")
)

deployment_name = os.getenv("AZURE_OPENAI_DEPLOYMENT")

def generate_query(state):
    print("Generate Query Node")

    prompt = f"""
    Covert the user request into SQL.

    Table:
    Product(
        id,
        sku,
        product_name,
        description,
        price
    )
    User Reuest:
    {state['user_input']}
    return ONLY SQL.
    """

    response= client.chat.completions.create(
        model=deployment_name,
        messages=[
            {
                "role": "user",
                "content":prompt
            }
        ]

    )

    sql=response.choices[0].message.content

    print("Generated SQL:")
    print(sql)


    return {
        "sql_query":sql
    }