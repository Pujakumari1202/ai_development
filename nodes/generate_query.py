import os
from dotenv import load_dotenv
from openai import AzureOpenAI

load_dotenv()

client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
)

deployment_name = os.getenv("AZURE_OPENAI_DEPLOYMENT")


def generate_query(state):

    print("\nGENERATE QUERY NODE")

    user_input = state["user_input"]
    prompt = f"""
    You are an Intent Classifier and SQL Generator.

    Database Schema:

    Table: Product

    Columns:
    - id
    - sku
    - product_name
    - description
    - price

    Intent Types:

    PRODUCT -> Product details only
    SUPPLIER -> Supplier details only
    BOTH -> Product and Supplier details
    CHAT -> Greetings / casual conversation

    Rules:
    1. Return JSON only.
    2. Do not explain anything.
    3. Generate PostgreSQL SELECT query only.
    4. For CHAT, sql_query should be empty.

    Examples:

    User: Show product details for SKU123

    {{
        "intent":"PRODUCT",
        "sql_query":"SELECT * FROM Product WHERE sku='SKU123';"
    }}

    User: Show supplier details for SKU123

    {{
        "intent":"SUPPLIER",
        "sql_query":"SELECT * FROM Product WHERE sku='SKU123';"
    }}

    User: Show product and supplier details for SKU123

    {{
        "intent":"BOTH",
        "sql_query":"SELECT * FROM Product WHERE sku='SKU123';"
    }}

    User: Hello

    {{
        "intent":"CHAT",
        "sql_query":""
    }}

    User Request:
    {user_input}
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

    sql_query = response.choices[0].message.content.strip()

    print("Generated SQL:")
    print(sql_query)

    return {
        "sql_query": sql_query
    }