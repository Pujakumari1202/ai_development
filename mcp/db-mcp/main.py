from fastapi import FastAPI
import uvicorn
from app.server import mcp
from app import tools

app = FastAPI()

@app.post("/call_tool")
async def call_tool(request: dict):
    """Handle HTTP requests to call MCP tools"""
    tool_name = request.get("tool_name")
    params = request.get("params", {})
    
    try:
        if tool_name == "run_query":
            print("MCP Executing query...")
            result = tools.run_query(query=params.get("query"))
            return {"result": result}
        return {"error": f"Tool '{tool_name}' not found"}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=9000)