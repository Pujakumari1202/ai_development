import os
from dotenv import load_dotenv
load_dotenv()

print('Testing database connection...')
print(f'Host: {os.getenv("DB_HOST")}')
print(f'Port: {os.getenv("DB_PORT")}')
print(f'DB: {os.getenv("DB_NAME")}')
print(f'User: {os.getenv("DB_USER")}')

import psycopg
try:
    print('Connecting to database...')
    conn = psycopg.connect(
        host=os.getenv('DB_HOST'),
        port=int(os.getenv('DB_PORT', '5432')),
        dbname=os.getenv('DB_NAME'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD')
    )
    print('Connected successfully!')
    
    cur = conn.cursor()
    print('Executing query...')
    cur.execute('SELECT * FROM products LIMIT 1;')
    print('Query executed!')
    
    rows = cur.fetchall()
    print(f'Result: {rows}')
    
    cur.close()
    conn.close()
    print('Test PASSED!')
except Exception as e:
    print(f'ERROR: {type(e).__name__}: {str(e)}')
    import traceback
    traceback.print_exc()
