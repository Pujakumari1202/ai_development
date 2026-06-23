from app.server import mcp
from app.db import get_connection


def _fetch_all_as_dicts(cur):
    rows = cur.fetchall()
    columns = [desc[0] for desc in cur.description]
    return [dict(zip(columns, row)) for row in rows]


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
        
