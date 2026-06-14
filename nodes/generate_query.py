import os
import json
from dotenv import load_dotenv
from openai import AzureOpenAI

load_dotenv()

client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    api_version=os.getenv("AZURE_OPENAI_API_VERSION")
)

deployment_name = os.getenv("AZURE_OPENAI_DEPLOYMENT")


def generate_query(state):

    print("\nGENERATE QUERY NODE")

    user_input = state["user_input"]

    prompt = f"""
    You are an Intent Classifier and SQL Generator.

    Database Tables:

    Product(
        id,
        sku,
        product_name,
        description,
        price
    )

    Supplier(
        id,
        sku,
        supplier_name,
        contact,
        email
    )

    Intent Types:

    PRODUCT
    SUPPLIER
    BOTH
    CHAT

    Return JSON ONLY.

    Examples:

    {{
    "intent":"PRODUCT",
    "product_query":"SELECT * FROM Product WHERE sku='QBAKE';"
    }}

    {{
    "intent":"SUPPLIER",
    "supplier_query":"SELECT * FROM Supplier WHERE sku='QBAKE';"
    }}

    {{
    "intent":"BOTH",
    "product_query":"SELECT * FROM Product WHERE sku='QBAKE';",
    "supplier_query":"SELECT * FROM Supplier WHERE sku='QBAKE';"
    }}

    {{
    "intent":"CHAT",
    "response":"Hello! How can I help you today?"
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

    result = response.choices[0].message.content
    #result = result.replace("```json", "").replace("```", "").strip()

    print("LLM Output:")
    print(result)

    data = json.loads(result)

    return {
    "intent": data.get("intent"),
    "product_query": data.get("product_query", ""),
    "supplier_query": data.get("supplier_query", ""),
    "response": data.get("response", "")
   } 