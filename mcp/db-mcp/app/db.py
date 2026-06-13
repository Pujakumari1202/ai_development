import os
from dotenv import load_dotenv
import psycopg

load_dotenv()

def get_connection():
    return psycopg.connect(
        host=os.getenv("DB_HOST"),
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        port=os.getenv("DB_PORT"),
    )
# conn = get_connection()
# cur = conn.cursor()
# testq="SELECT * FROM product"
# cur.execute(testq)
# print(cur.fetchall())