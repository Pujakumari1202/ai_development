from app.server import mcp
from app.db import get_connection


@mcp.tool(name="execute_query")
def execute_query(sql_query: str):
    """Execute a SQL query against the configured database."""
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql_query)
            rows = cur.fetchall()
            return rows


# If you want to generate SQL from user input in a separate layer, keep that outside this
# tool and pass the generated SQL string into execute_query().
