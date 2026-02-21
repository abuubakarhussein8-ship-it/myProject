import psycopg2

# Connect to the default postgres database
conn = psycopg2.connect(
    host='localhost',
    port='5432',
    database='postgres',
    user='postgres',
    password='Abu2026'
)
cur = conn.cursor()

# Check for users
cur.execute("SELECT rolname FROM pg_roles WHERE rolname = 'Abuu'")
users = cur.fetchall()
print("Users:", users)

# Check for databases
cur.execute("SELECT datname FROM pg_database WHERE datname = 'library_db'")
databases = cur.fetchall()
print("Databases:", databases)

cur.close()
conn.close()
