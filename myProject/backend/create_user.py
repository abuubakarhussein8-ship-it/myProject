import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Connect to the default postgres database
conn = psycopg2.connect(
    host='localhost',
    port='5432',
    database='postgres',
    user='postgres',
    password='Abu2026'
)
conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
cur = conn.cursor()

# Create the user
try:
    cur.execute("CREATE USER Abuu WITH PASSWORD 'Abu2026';")
    print("User 'Abuu' created successfully!")
except Exception as e:
    print(f"Error creating user: {e}")

# Grant privileges
try:
    cur.execute("GRANT ALL PRIVILEGES ON DATABASE library_db TO Abuu;")
    print("Privileges granted!")
except Exception as e:
    print(f"Error granting privileges: {e}")

# Verify
cur.execute("SELECT rolname FROM pg_roles WHERE rolname = 'Abuu'")
users = cur.fetchall()
print("Users after creation:", users)

cur.close()
conn.close()
