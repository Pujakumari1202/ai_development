import httpx
import json

MCP_SERVER_URL = "http://127.0.0.1:9000"

def run_query_via_mcp(query: str):
    """Call run_query tool on MCP server via HTTP"""
    try:
        print("MCP Running query through MCP server...")
        
        with httpx.Client() as client:
            response = client.post(
                f"{MCP_SERVER_URL}/call_tool",
                json={"tool_name": "run_query", "params": {"query": query}}
            )
            
            if response.status_code != 200:
                raise Exception(f"MCP Server returned {response.status_code}: {response.text}")
            
            result = response.json()
            return result.get("result", [])
    except Exception as e:
        print(f"[ERROR] MCP Server call failed: {str(e)}")
        raise
