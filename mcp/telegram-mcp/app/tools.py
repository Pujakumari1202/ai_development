from app.server import mcp


@mcp.tool()
def greet(name: str):
    return ("Hello",name )
        
