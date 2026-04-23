## Overview 

The backend is set up so all the the APIs and file set up is modular from each other and the correclated files are put 
in their respective diretory

### core/ 

- Configuration, environment variables, and security utilities

### db/ 

- Database setup, ORM base configuration, session management

### models/ 

- SQLAlchemy ORM models (Admin, Book, Librarian, User database entities)

### schemas/ 

- Pydantic validation schemas for request/response data

### services/ 

- Business logic layer (admin, auth, book, user service implementations)

