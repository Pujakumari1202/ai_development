import psycopg
import os
from dotenv import load_dotenv
load_dotenv()

conn = psycopg.connect(
    host=os.getenv('DB_HOST'),
    port=int(os.getenv('DB_PORT')),
    dbname=os.getenv('DB_NAME'),
    user=os.getenv('DB_USER'),
    password=os.getenv('DB_PASSWORD')
)

cur = conn.cursor()

# Check tables
cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
tables = cur.fetchall()
print('Tables:', tables)

# Check product data
cur.execute('SELECT COUNT(*) FROM product')
count = cur.fetchone()
print(f'Product count: {count[0]}')

# Show columns
cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name='product'")
columns = cur.fetchall()
print('Columns:', columns)

cur.close()
conn.close()
