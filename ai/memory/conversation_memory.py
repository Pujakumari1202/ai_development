import json
import os
from pathlib import Path

import psycopg

from dotenv import load_dotenv

load_dotenv()

REQUIRED_PROCUREMENT_TABLES = {
    "customers",
    "suppliers",
    "products",
    "orders",
    "order_lines",
}


def _load_sql_script(path):
    lines = path.read_text(encoding="utf-8").splitlines()
    filtered_lines = [line for line in lines if not line.lstrip().startswith("\\")]
    return "\n".join(filtered_lines)


def get_connection():
    return psycopg.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        connect_timeout=5,
    )


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


def ensure_procurement_tables():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
                """
            )
            existing_tables = {row[0] for row in cur.fetchall()}

        missing_tables = REQUIRED_PROCUREMENT_TABLES - existing_tables
        if not missing_tables:
            return

        project_root = Path(__file__).resolve().parent.parent
        schema_path = project_root / "schema.sql"
        data_path = project_root / "data.sql"

        if not schema_path.exists() or not data_path.exists():
            missing_files = []
            if not schema_path.exists():
                missing_files.append(str(schema_path))
            if not data_path.exists():
                missing_files.append(str(data_path))
            raise FileNotFoundError(
                "Missing SQL bootstrap files: " + ", ".join(missing_files)
            )

        with conn.cursor() as cur:
            cur.execute(_load_sql_script(schema_path))
            cur.execute(_load_sql_script(data_path))
        conn.commit()


def load_session_memory(session_id, limit=12):
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

    history = [
        {"role": role, "message": message}
        for role, message in reversed(rows)
    ]
    active_order_context = context_row[0] if context_row and context_row[0] else {}

    return history, active_order_context


def append_message(session_id, role, message):
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


def save_active_order_context(session_id, active_order_context):
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