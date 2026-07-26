import json

from app.server import mcp
from app.db import get_connection


def _fetch_all_as_dicts(cur):
    rows = cur.fetchall()
    columns = [desc[0] for desc in cur.description]
    return [dict(zip(columns, row)) for row in rows]


@mcp.tool()
def ensure_memory_tables():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS public.conversation_sessions (
                    session_id VARCHAR(100) PRIMARY KEY,
                    active_order_context JSONB NOT NULL DEFAULT '{}'::jsonb,
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS public.conversation_messages (
                    message_id BIGSERIAL PRIMARY KEY,
                    session_id VARCHAR(100) NOT NULL,
                    role VARCHAR(20) NOT NULL,
                    message TEXT NOT NULL,
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT fk_conversation_session
                        FOREIGN KEY (session_id)
                        REFERENCES public.conversation_sessions(session_id)
                        ON DELETE CASCADE
                )
                """
            )
        conn.commit()
    return {"status": "ok"}


@mcp.tool()
def load_session_memory(session_id: str, limit: int = 12):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO public.conversation_sessions (session_id)
                VALUES (%s)
                ON CONFLICT (session_id) DO NOTHING
                """,
                (session_id,),
            )
            cur.execute(
                """
                SELECT role, message
                FROM public.conversation_messages
                WHERE session_id = %s
                ORDER BY message_id DESC
                LIMIT %s
                """,
                (session_id, limit),
            )
            rows = cur.fetchall()
            cur.execute(
                """
                SELECT active_order_context
                FROM public.conversation_sessions
                WHERE session_id = %s
                """,
                (session_id,),
            )
            context_row = cur.fetchone()
        conn.commit()

    history = [{"role": role, "message": message} for role, message in reversed(rows)]
    active_order_context = context_row[0] if context_row and context_row[0] else {}
    return {"history": history, "active_order_context": active_order_context}


@mcp.tool()
def append_message(session_id: str, role: str, message: str):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO public.conversation_sessions (session_id)
                VALUES (%s)
                ON CONFLICT (session_id) DO NOTHING
                """,
                (session_id,),
            )
            cur.execute(
                """
                INSERT INTO public.conversation_messages (session_id, role, message)
                VALUES (%s, %s, %s)
                """,
                (session_id, role, message),
            )
        conn.commit()
    return {"status": "ok"}


@mcp.tool()
def save_active_order_context(session_id: str, active_order_context: dict):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO public.conversation_sessions (session_id, active_order_context)
                VALUES (%s, %s::jsonb)
                ON CONFLICT (session_id)
                DO UPDATE SET
                    active_order_context = EXCLUDED.active_order_context,
                    updated_at = CURRENT_TIMESTAMP
                """,
                (session_id, json.dumps(active_order_context)),
            )
        conn.commit()
    return {"status": "ok"}


@mcp.tool()
def run_query(query: str):

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query)
            return _fetch_all_as_dicts(cur)


@mcp.tool()
def find_product_suppliers(product_name: str):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                    p.product_id,
                    p.product_name,
                    s.supplier_id,
                    s.supplier_name,
                    s.phone_number,
                    s.turnaround_time,
                    p.price
                FROM public.products p
                JOIN public.suppliers s ON p.supplier_id = s.supplier_id
                WHERE p.product_name ILIKE %s
                ORDER BY p.price ASC
                """,
                (f"%{product_name}%",),
            )
            return _fetch_all_as_dicts(cur)


@mcp.tool()
def get_supplier_options(product_name: str, required_by: str = ""):
    with get_connection() as conn:
        with conn.cursor() as cur:
            if required_by:
                cur.execute(
                    """
                    SELECT
                        p.product_id,
                        p.product_name,
                        s.supplier_id,
                        s.supplier_name,
                        s.phone_number,
                        s.turnaround_time,
                        p.price
                                        FROM public.products p
                                        JOIN public.suppliers s ON p.supplier_id = s.supplier_id
                    WHERE p.product_name ILIKE %s
                      AND s.turnaround_time ILIKE %s
                    ORDER BY p.price ASC
                    """,
                    (f"%{product_name}%", f"%{required_by}%"),
                )
            else:
                cur.execute(
                    """
                    SELECT
                        p.product_id,
                        p.product_name,
                        s.supplier_id,
                        s.supplier_name,
                        s.phone_number,
                        s.turnaround_time,
                        p.price
                    FROM public.products p
                    JOIN public.suppliers s ON p.supplier_id = s.supplier_id
                    WHERE p.product_name ILIKE %s
                    ORDER BY p.price ASC
                    """,
                    (f"%{product_name}%",),
                )
            return _fetch_all_as_dicts(cur)
        
