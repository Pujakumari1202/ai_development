import os
import psycopg

from dotenv import load_dotenv

load_dotenv()


def run_query(query):

    conn = psycopg.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD")
    )

    cur = conn.cursor()

    cur.execute(query)

    rows = cur.fetchall()

    columns = [
        desc[0]
        for desc in cur.description
    ]

    cur.close()
    conn.close()

    result = []

    for row in rows:
        result.append(
            dict(zip(columns, row))
        )

    return result