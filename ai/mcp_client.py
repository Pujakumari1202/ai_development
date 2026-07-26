import os

import httpx
from dotenv import load_dotenv

load_dotenv()

MCP_SERVER_URL = os.getenv("MCP_SERVER_URL", "http://127.0.0.1:9000").rstrip("/")


def _call_mcp_tool(tool_name: str, params: dict):
    with httpx.Client(timeout=30.0) as client:
        response = client.post(
            f"{MCP_SERVER_URL}/call_tool",
            json={"tool_name": tool_name, "params": params},
        )

        if response.status_code != 200:
            raise Exception(f"MCP Server returned {response.status_code}: {response.text}")

        payload = response.json()
        if payload.get("error"):
            raise Exception(payload["error"])

        return payload.get("result", [])


def ensure_memory_tables_via_mcp():
    return _call_mcp_tool("ensure_memory_tables", {})


def load_session_memory_via_mcp(session_id: str, limit: int = 12):
    return _call_mcp_tool(
        "load_session_memory",
        {"session_id": session_id, "limit": limit},
    )


def append_message_via_mcp(session_id: str, role: str, message: str):
    return _call_mcp_tool(
        "append_message",
        {"session_id": session_id, "role": role, "message": message},
    )


def save_active_order_context_via_mcp(session_id: str, active_order_context: dict):
    return _call_mcp_tool(
        "save_active_order_context",
        {"session_id": session_id, "active_order_context": active_order_context},
    )

def run_query_via_mcp(query: str):
    """Call run_query tool on MCP server via HTTP"""
    try:
        print("MCP Running query through MCP server...")
        return _call_mcp_tool("run_query", {"query": query})
    except Exception as e:
        print(f"[ERROR] MCP Server call failed: {str(e)}")
        raise


def find_product_suppliers_via_mcp(product_name: str):
    try:
        print("MCP Finding product suppliers...")
        return _call_mcp_tool("find_product_suppliers", {"product_name": product_name})
    except Exception as e:
        print(f"[ERROR] MCP supplier lookup failed: {str(e)}")
        raise


def get_supplier_options_via_mcp(product_name: str, required_by: str = ""):
    try:
        print("MCP Getting supplier options...")
        return _call_mcp_tool(
            "get_supplier_options",
            {"product_name": product_name, "required_by": required_by}
        )
    except Exception as e:
        print(f"[ERROR] MCP supplier options lookup failed: {str(e)}")
        raise
