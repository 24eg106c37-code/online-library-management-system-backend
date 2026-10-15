# Project documentation

## Purpose

Evergreen Library is a responsive web application for maintaining a small lending library. Its member experience focuses on finding books and managing loans; its administration experience supports catalog updates and library-wide visibility.

## Architecture

```text
React/Vite browser app
  └── JSON REST API (JWT bearer token)
        ├── Spring Security authorization
        ├── Controllers → services → Spring Data repositories
        └── MySQL (users, books, borrow_records)
```

The browser stores the signed JWT in local storage and attaches it to API requests. The backend validates the signature and expiration on every request, assigns the role from the signed token, and applies role checks to administrator routes. Passwords are BCrypt hashes; password hashes and signing secrets are never included in API responses.

## Core data rules

- Email is unique; public signup always assigns `USER`.
- A non-empty ISBN is unique.
- Copy counts must be positive and available copies cannot exceed total copies.
- Borrowing and returning are transactional and lock the relevant database rows.
- A loan cannot be created when no copies are available. A loan can only be returned once and only by its member or an administrator.
- Each loan has a due date 14 days after borrowing.
- Borrow records reference both users and books with restrictive foreign keys. The API will not delete books with borrowing history.
- Production schema changes are deliberately controlled outside automatic startup behavior (`DDL_AUTO=validate`).

## Local configuration

See the root README for Windows PowerShell commands and the `.env.example` template. Backend variables:

| Variable | Required in production | Description |
|---|---:|---|
| `DB_URL` | Yes | MySQL JDBC URL including provider TLS options |
| `DB_USERNAME` / `DB_PASSWORD` | Yes | Database credentials |
| `DDL_AUTO` | Yes | Set to `validate` in production |
| `JWT_SECRET` | Yes | Random signing key, minimum 32 bytes |
| `JWT_EXPIRATION_MS` | No | Token lifetime; defaults to one day |
| `CORS_ALLOWED_ORIGIN` | Yes | Exact browser origin allowed to call the API |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | For first setup | Creates an administrator if that email is not already in the database |
| `PORT` | No | HTTP port supplied by Render; defaults to 8080 locally |

The browser variable `VITE_API_BASE_URL` is compiled into the frontend bundle and should end in `/api`.

## Deployment decision

The backend is packaged as a Docker-based Render web service because the API is Java/Spring Boot. The React application is a Render Static Site with a single-page-app rewrite. Render does not provide managed MySQL, so the production database must be sourced from a compatible external provider. Choose a provider whose network access, backups, TLS, and pricing meet the project's needs; configure its connection values as Render environment variables, never in source control.

## Verification boundaries

The backend integration suite uses H2 and covers authentication, role permissions, book CRUD/validation, ISBN uniqueness, available-copy enforcement, and single returns. The frontend can be verified with `npm run build`. Neither a production database nor a Render deployment is included or claimed as tested.
