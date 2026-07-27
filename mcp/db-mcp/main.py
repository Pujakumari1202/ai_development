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
        if tool_name == "ensure_memory_tables":
            result = tools.ensure_memory_tables()
            return {"result": result}
        if tool_name == "load_session_memory":
            result = tools.load_session_memory(
                session_id=params.get("session_id", ""),
                limit=params.get("limit", 12),
            )
            return {"result": result}
        if tool_name == "append_message":
            result = tools.append_message(
                session_id=params.get("session_id", ""),
                role=params.get("role", ""),
                message=params.get("message", ""),
            )
            return {"result": result}
        if tool_name == "save_active_order_context":
            result = tools.save_active_order_context(
                session_id=params.get("session_id", ""),
                active_order_context=params.get("active_order_context", {}),
            )
            return {"result": result}
        if tool_name == "create_pending_supplier_outreach":
            result = tools.create_pending_supplier_outreach(
                customer_session_id=params.get("customer_session_id", ""),
                customer_phone_number=params.get("customer_phone_number", ""),
                supplier_phone_number=params.get("supplier_phone_number", ""),
                supplier_name=params.get("supplier_name", ""),
                product_name=params.get("product_name", ""),
                quantity=params.get("quantity"),
                request_message=params.get("request_message", ""),
            )
            return {"result": result}
        if tool_name == "find_pending_supplier_outreach_by_supplier_phone":
            result = tools.find_pending_supplier_outreach_by_supplier_phone(
                supplier_phone_number=params.get("supplier_phone_number", ""),
            )
            return {"result": result}
        if tool_name == "complete_pending_supplier_outreach":
            result = tools.complete_pending_supplier_outreach(
                outreach_id=params.get("outreach_id", 0),
                supplier_reply=params.get("supplier_reply", ""),
            )
            return {"result": result}
        return {"error": f"Tool '{tool_name}' not found"}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=9000)