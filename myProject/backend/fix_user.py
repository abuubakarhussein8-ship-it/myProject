import psycopg2

# Connect to postgres database
conn = psycopg2.connect(
    host='localhost',
    port='5432',
    database='postgres',
    user='postgres',
    password='Abu2026'
)
cur = conn.cursor()

# Check for both cases
cur.execute("SELECT rolname FROM pg_roles WHERE rolname IN ('abu', 'Ab u', 'ABUU')")
print("Similar users:", cur.fetchall())

# Let's see all roles that start with 'a'
cur.execute("SELECT rolname FROM pg_roles WHERE rolname LIKE 'a%'")
print("All roles starting with a:", cur.fetchall())

cur.close()
conn.close()
