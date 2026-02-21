"""
Script to set up PostgreSQL database for Library Management System
"""
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Connection parameters - connect to default 'postgres' database first
DB_HOST = 'localhost'
DB_PORT = '5432'
DB_NAME = 'postgres'
DB_USER = 'postgres'
DB_PASSWORD = 'Abu2026'  # Default postgres password

# New database and user details
NEW_DB_NAME = 'library_db'
NEW_DB_USER = 'Abuu'
NEW_DB_PASSWORD = 'Abu2026'

def setup_postgresql():
    """Create user and database if they don't exist"""
    try:
        # Connect to default postgres database
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Create user if not exists
        cursor.execute(f"SELECT 1 FROM pg_roles WHERE rolname = '{NEW_DB_USER}'")
        if not cursor.fetchone():
            cursor.execute(f"CREATE USER {NEW_DB_USER} WITH PASSWORD '{NEW_DB_PASSWORD}';")
            print(f"User '{NEW_DB_USER}' created successfully!")
        else:
            print(f"User '{NEW_DB_USER}' already exists.")
        
        # Create database if not exists
        cursor.execute(f"SELECT 1 FROM pg_database WHERE datname = '{NEW_DB_NAME}'")
        if not cursor.fetchone():
            cursor.execute(f"CREATE DATABASE {NEW_DB_NAME} OWNER {NEW_DB_USER};")
            print(f"Database '{NEW_DB_NAME}' created successfully!")
        else:
            print(f"Database '{NEW_DB_NAME}' already exists.")
        
        # Grant privileges
        cursor.execute(f"GRANT ALL PRIVILEGES ON DATABASE {NEW_DB_NAME} TO {NEW_DB_USER};")
        print(f"Privileges granted to '{NEW_DB_USER}' on '{NEW_DB_NAME}'!")
        
        cursor.close()
        conn.close()
        print("\nPostgreSQL setup completed successfully!")
        
    except psycopg2.OperationalError as e:
        print(f"Error connecting to PostgreSQL: {e}")
        print("\nMake sure PostgreSQL is installed and running.")
        print("You may need to install PostgreSQL from: https://www.postgresql.org/download/windows/")
        return False
    
    return True

if __name__ == "__main__":
    setup_postgresql()
