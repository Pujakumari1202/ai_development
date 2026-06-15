from typing import Any

from app.tools import execute_query


def generate_query(user_input: str) -> str:
    """Convert natural language input into SQL.

    Replace this placeholder with LangGraph text-to-SQL generation if you want a real
    AI-driven query generator.
    """
    clean_input = user_input.replace("'", "''")
    return (
        "SELECT * FROM product "
        f"WHERE name ILIKE '%{clean_input}%' "
        "LIMIT 50"
    )


def execute_query_via_mcp(sql_query: str) -> list[Any]:
    return execute_query(sql_query)


def show_response(rows: list[Any]) -> dict[str, Any]:
    return {"row_count": len(rows), "rows": rows}


def user_input_to_response(user_input: str) -> dict[str, Any]:
    sql = generate_query(user_input)
    rows = execute_query_via_mcp(sql)
    return {"sql": sql, "response": show_response(rows)}
