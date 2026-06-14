import os
import asyncio

from dotenv import load_dotenv
from fastmcp import Client

load_dotenv()

MCP_SERVER_PATH = os.getenv("MCP_SERVER_PATH")

client = Client(MCP_SERVER_PATH)


async def call_mcp(query: str):

    async with client:

        result = await client.call_tool(
            "run_query",
            {
                "query": query
            }
        )

        return result


def execute_query(state):

    print("\nEXECUTE QUERY NODE")

    intent = state.get("intent")

    if intent == "PRODUCT":

        result = asyncio.run(
            call_mcp(state["product_query"])
        )

        return {
            "product_data": result
        }

    elif intent == "SUPPLIER":

        result = asyncio.run(
            call_mcp(state["supplier_query"])
        )

        return {
            "supplier_data": result
        }

    elif intent == "BOTH":

        product_result = asyncio.run(
            call_mcp(state["product_query"])
        )

        supplier_result = asyncio.run(
            call_mcp(state["supplier_query"])
        )

        return {
            "product_data": product_result,
            "supplier_data": supplier_result
        }

    return {}