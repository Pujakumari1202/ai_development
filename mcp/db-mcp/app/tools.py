from app.server import mcp
from app.db import get_connection
#comment

@mcp.tool()
def run_query(query: str):

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query)
            rows = cur.fetchall()
            return rows
        
