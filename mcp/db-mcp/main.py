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
        if tool_name == "find_product_suppliers":
            result = tools.find_product_suppliers(product_name=params.get("product_name", ""))
            return {"result": result}
        if tool_name == "get_supplier_options":
            result = tools.get_supplier_options(
                product_name=params.get("product_name", ""),
                required_by=params.get("required_by", ""),
            )
            return {"result": result}
        return {"error": f"Tool '{tool_name}' not found"}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=9000)