from app.server import mcp
import app.tools

if __name__ == "__main__":
    mcp.run(transport="http", host="127.0.0.1", port=9000)
    # mcp.run(transport="stdio")