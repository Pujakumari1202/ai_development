from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from app.tools import execute_query

app = FastAPI(title="DB MCP HTTP Adapter")


class ExecuteQueryRequest(BaseModel):
    sql_query: str


class QueryResponse(BaseModel):
    rows: list


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/execute_query", response_model=QueryResponse)
def execute_query_endpoint(request: ExecuteQueryRequest):
    try:
        rows = execute_query(request.sql_query)
        return {"rows": rows}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
