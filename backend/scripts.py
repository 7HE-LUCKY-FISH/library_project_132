from app.core.env import load_environment

load_environment()

from app.db.init_db import create_tables

# Calls the function to create the database tables when the script is run

def main() -> None:
    create_tables()
    print("Database tables created.")


if __name__ == "__main__":
    main()
