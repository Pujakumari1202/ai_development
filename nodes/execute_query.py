import os
import asyncio
from dotenv import load_dotenv
from fastmcp import Client

load_dotenv()

MCP_SERVER_PATH = os.getenv("MCP_SERVER_PATH")

client = Client({
    "mcpServers": {
        "db": {
            "command": "python",
            "args": [MCP_SERVER_PATH]
        }
    }
})


async def call_mcp(query: str):
    try:
        async with client:
            result = await client.call_tool(
                "run_query",
                {"query": query}
            )
            return result
    except Exception as e:
        print("MCP ERROR:", e)
        return []


def execute_query(state):

    print("\nEXECUTE QUERY NODE")

    intent = state.get("intent")

    
    if intent == "PRODUCT":

        if not state.get("product_query"):
            return {"product_data": []}

        result = asyncio.run(call_mcp(state["product_query"]))

        return {
            "product_data": result
        }

    
    elif intent == "SUPPLIER":

        if not state.get("supplier_query"):
            return {"supplier_data": []}

        result = asyncio.run(call_mcp(state["supplier_query"]))

        return {
            "supplier_data": result
        }

    elif intent == "BOTH":

        product_result = []
        supplier_result = []

        if state.get("product_query"):
            product_result = asyncio.run(call_mcp(state["product_query"]))

        if state.get("supplier_query"):
            supplier_result = asyncio.run(call_mcp(state["supplier_query"]))

        return {
            "product_data": product_result,
            "supplier_data": supplier_result
        }

    
    return {
        "response": state.get("response", "Hello! How can I help you?")
    }






# def execute_query(state):

#     print("\nEXECUTE QUERY NODE")

#     if state["intent"] == "PRODUCT":
#         return {
#             "product_data": [
#                 {
#                     "sku": "QBAKE",
#                     "product_name": "Chocolate Cake",
#                     "price": 250
#                 }
#             ]
#         }

#     elif state["intent"] == "SUPPLIER":
#         return {
#             "supplier_data": [
#                 {
#                     "supplier_name": "ABC Bakery",
#                     "contact": "9876543210",
#                     "email": "abc@gmail.com"
#                 }
#             ]
#         }

#     elif state["intent"] == "BOTH":
#         return {
#             "product_data": [
#                 {
#                     "sku": "QBAKE",
#                     "product_name": "Chocolate Cake",
#                     "price": 250
#                 }
#             ],
#             "supplier_data": [
#                 {
#                     "supplier_name": "ABC Bakery",
#                     "contact": "9876543210",
#                     "email": "abc@gmail.com"
#                 }
#             ]
#         }

#     return {}


