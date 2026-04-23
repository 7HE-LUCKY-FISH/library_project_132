# Database Schema Documentation

This document describes the database schema for the Library Management System.

## Overview

The database consists of 4 main tables that manage users, books, librarians, and administrators in a library system.

## Tables

### 1. Users Table (`users`)

Stores information about library users who can borrow books.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, INDEX | Unique identifier for the user |
| `first_name` | VARCHAR(255) | NOT NULL | User's first name |
| `last_name` | VARCHAR(255) | NOT NULL | User's last name |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL, INDEX | User's email address |
| `username` | VARCHAR(255) | UNIQUE, NOT NULL, INDEX | User's username |
| `education` | VARCHAR(255) | NOT NULL | User's education level/field |
| `password_hash` | VARCHAR(255) | NOT NULL | Hashed password for authentication |
| `is_approved` | BOOLEAN | NOT NULL, DEFAULT FALSE | Whether the user account is approved |
| `created_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() | Account creation timestamp |

### 2. Books Table (`books`)

Contains information about books available in the library.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, INDEX | Unique identifier for the book |
| `title` | VARCHAR(255) | UNIQUE, NOT NULL, INDEX | Book title |
| `genre` | TEXT | NOT NULL | Book genre/category |
| `image_url` | VARCHAR(512) | NULL | URL to book cover image |
| `created_by_librarian_id` | INTEGER | FOREIGN KEY → librarians.id, ON DELETE SET NULL | ID of librarian who added the book |
| `created_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() | Book creation timestamp |
| `updated_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW(), ON UPDATE NOW() | Last update timestamp |

### 3. Librarians Table (`librarians`)

Stores information about library staff members who manage the library.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, INDEX | Unique identifier for the librarian |
| `first_name` | VARCHAR(255) | NOT NULL | Librarian's first name |
| `last_name` | VARCHAR(255) | NOT NULL | Librarian's last name |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL, INDEX | Librarian's email address |
| `position` | VARCHAR(255) | NOT NULL | Librarian's job position/title |
| `password_hash` | VARCHAR(255) | NOT NULL | Hashed password for authentication |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | Whether the librarian account is active |
| `created_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() | Account creation timestamp |

### 4. Admins Table (`admins`)

Contains administrator accounts with system-wide privileges.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, INDEX | Unique identifier for the admin |
| `username` | VARCHAR(255) | UNIQUE, NOT NULL, INDEX | Admin username |
| `password_hash` | VARCHAR(255) | NOT NULL | Hashed password for authentication |
| `created_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() | Account creation timestamp |

## Relationships

### Foreign Key Relationships

1. **Books → Librarians**
   - `books.created_by_librarian_id` → `librarians.id`
   - When a librarian is deleted, the `created_by_librarian_id` is set to NULL
   - A librarian can create multiple books (One-to-Many)

## Indexes

The following indexes are created for performance optimization:

- `users.id` (Primary Key)
- `users.email` (Unique)
- `users.username` (Unique)
- `books.id` (Primary Key)
- `books.title` (Unique)
- `librarians.id` (Primary Key)
- `librarians.email` (Unique)
- `admins.id` (Primary Key)
- `admins.username` (Unique)

## Constraints

### Unique Constraints
- `users.email`: Each email can only be registered once
- `users.username`: Each username must be unique
- `books.title`: Each book title must be unique
- `librarians.email`: Each librarian email must be unique
- `admins.username`: Each admin username must be unique

### Not Null Constraints
- All fields except `books.image_url` and `books.created_by_librarian_id` are required
- `books.created_by_librarian_id` can be NULL (when the creating librarian is deleted)

## Data Types

- **INTEGER**: Used for primary keys and foreign keys
- **VARCHAR(n)**: Variable-length strings with maximum length n
- **TEXT**: Variable-length text (unlimited length)
- **BOOLEAN**: True/false values
- **TIMESTAMP WITH TIME ZONE**: Date and time with timezone information

## Default Values

- `users.is_approved`: FALSE
- `librarians.is_active`: TRUE
- `created_at` fields: Current timestamp (NOW())
- `books.updated_at`: Current timestamp, auto-updates on modification

## Notes

- All timestamps are stored with timezone information
- Passwords are stored as hashes, not plain text
- The system supports user approval workflow (users need approval to access the system)
- Librarians can be deactivated but their records are preserved
- Book titles must be unique to prevent duplicates
- The relationship between books and librarians is optional (books can exist without a creator)