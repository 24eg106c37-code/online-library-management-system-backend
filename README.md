# Evergreen Library

A full-stack Online Library Management System built for a technical training project. Members can browse and borrow books, manage active loans, and review their reading history. Administrators can manage the collection, view members, and monitor borrowing activity.

## Technology

- **Frontend:** React 18, Vite, React Router, Bootstrap 5
- **Backend:** Java 17, Spring Boot 3, Spring Web, Spring Security, Spring Data JPA
- **Database:** MySQL 8.0.16+; H2 is used for backend integration tests
- **Authentication:** BCrypt password hashing and signed JWT bearer tokens
- **Deployment:** Render Static Site and Docker Web Service; external managed MySQL database

## Project structure

```text
online-library-management-system/
├── frontend/
│   ├── public/                 # Render SPA fallback
│   └── src/
│       ├── assets/             # Local book-cover fallback
│       ├── components/         # Navigation, book cards, layout
│       ├── context/            # Authentication state
│       ├── pages/              # Home, catalog, login, dashboard, admin
│       ├── services/           # REST API client
│       ├── App.jsx
│       └── main.jsx
├── backend/
│   ├── src/main/java/com/library/
│   │   ├── config/             # CORS configuration
│   │   ├── controller/
│   │   ├── dto/
│   │   ├── exception/
│   │   ├── model/
│   │   ├── repository/
│   │   ├── security/
│   │   └── service/
│   ├── src/main/resources/application.properties
│   ├── src/test/                # H2-backed integration tests
│   ├── Dockerfile
│   └── pom.xml
├── database/schema.sql
├── docs/project-documentation.md
├── .env.example
├── render.yaml
└── README.md
```

## Requirements

- Node.js 20 or newer (npm included)
- Java 17
- Maven 3.8+ (`mvn -version` to check)
- MySQL 8.0.16+ for local interactive use
- Git for version control

Open the `online-library-management-system` folder in VS Code. The frontend and backend run independently in separate terminals.

## Database setup

1. Start a local MySQL 8 server.
2. Create the database and tables:

   ```powershell
   Get-Content .\database\schema.sql | mysql -u root -p
   ```

   Or open `database/schema.sql` in MySQL Workbench and execute it. If a managed database provider pre-creates the database and restricts `CREATE DATABASE`, run the table definitions against that database after removing the initial `CREATE DATABASE` and `USE` statements.
3. The backend defaults to `jdbc:mysql://localhost:3306/online_library`, username `root`, and an empty password. Set `DB_USERNAME` and `DB_PASSWORD` in your shell if your local MySQL installation differs.
4. For local development, Hibernate uses `DDL_AUTO=update` by default. This updates the local schema without dropping existing data. For an existing/production database, apply reviewed SQL changes and set `DDL_AUTO=validate`; never use `create`, `create-drop`, or `update` in production.

`database/schema.sql` uses `CREATE TABLE IF NOT EXISTS`, foreign keys, unique constraints, indexes, and quantity/status checks. It does not drop or reset any tables.

## Run locally on Windows

### 1. Start the backend

In a PowerShell terminal:

```powershell
cd backend
$env:DB_URL = "jdbc:mysql://localhost:3306/online_library?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = "your-local-mysql-password"
$env:JWT_SECRET = "use-a-random-secret-of-at-least-32-characters"
mvn spring-boot:run
```

The API listens on `http://localhost:8080`; health check: `http://localhost:8080/api/health`.

### 2. Create the first administrator

Public registration always creates a `USER`; request data cannot assign the `ADMIN` role. To create the initial administrator, set `ADMIN_EMAIL` and `ADMIN_PASSWORD` **before the first startup**. On startup the backend creates that account only if the email is not already present:

```powershell
$env:ADMIN_EMAIL = "admin@example.com"
$env:ADMIN_PASSWORD = "choose-a-strong-unique-password"
mvn spring-boot:run
```

No default administrator password is shipped. Remove these environment variables after bootstrap if you do not want them retained in the process environment. Existing accounts are never promoted or have their passwords overwritten by this bootstrap.

### 3. Start the frontend

Open a second PowerShell terminal:

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

Visit the Vite URL shown in the terminal (normally `http://localhost:5173`). Set `VITE_API_BASE_URL` in `frontend/.env` when the backend is hosted somewhere else. Vite reads this value when building the frontend.

## Build and tests

Frontend production build:

```powershell
cd frontend
npm run build
```

Backend compile, integration tests, and package:

```powershell
cd backend
mvn clean package
```

The backend test suite starts the application against an isolated in-memory H2 database; it does not need MySQL and does not alter your local library database.

## REST API

All responses use JSON except `DELETE /api/books/{id}` (204, no body). Errors use `{ "error", "message", "status", "timestamp" }`. Book/record lists are JSON arrays.

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a USER and return a JWT |
| POST | `/api/auth/login` | Public | Verify credentials and return a JWT |
| GET | `/api/auth/me` | Authenticated | Get the current safe user profile |
| GET | `/api/books` | Public | List books; optional `query` and `category` filters |
| GET | `/api/books/search?query=` | Public | Search titles and authors |
| GET | `/api/books/{id}` | Public | Get a book |
| POST | `/api/books` | ADMIN | Add a book |
| PUT | `/api/books/{id}` | ADMIN | Update a book |
| DELETE | `/api/books/{id}` | ADMIN | Delete a book with no borrowing history |
| POST | `/api/borrowing/borrow/{bookId}` | Authenticated | Borrow an available copy (14-day loan) |
| POST | `/api/borrowing/return/{recordId}` | Record owner or ADMIN | Return a loan once |
| GET | `/api/borrowing/my-records` | Authenticated | Get the signed-in member's loans and history |
| GET | `/api/borrowing/history` | ADMIN | Get all borrowing records |
| GET | `/api/admin/users` | ADMIN | List members without password hashes |
| GET | `/api/admin/records` | ADMIN | Get all borrowing records |
| GET | `/api/admin/stats` | ADMIN | Get collection and activity counts |
| GET | `/api/health` | Public | Render health check |

Send protected API requests with `Authorization: Bearer <token>`. Registration and login respond with `{ "token": "...", "user": { "id", "name", "email", "role", "createdAt" } }`. Input is validated on the server. Borrowing/return operations use database transactions and pessimistic row locks so simultaneous requests cannot over-borrow or return twice. Borrow history is retained; books referenced by history cannot be deleted.

## GitHub

From the project root:

```powershell
git init
git add .
git commit -m "Build Evergreen Library management system"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/online-library-management-system.git
git push -u origin main
```

Create the empty GitHub repository first. Never add `.env` files, database credentials, passwords, or JWT signing keys. `.gitignore` excludes local environment files and generated Java/Node/IDE/build artifacts. Configure deployment secrets in Render's environment-variable dashboard.

## Render deployment

1. Push the project to GitHub and connect the repository in Render.
2. Use the root `render.yaml` Blueprint or create the services manually:
   - **Frontend Static Site:** root `frontend`, build command `npm install && npm run build`, publish directory `dist`, SPA rewrite `/*` to `/index.html`.
   - **Backend Web Service:** Docker runtime using build context `backend` and `backend/Dockerfile`; Maven executes `mvn -B clean package`, then the Java 17 JRE runs the packaged JAR. Spring listens on Render's `PORT` (default 10000) and binds to all interfaces.
3. Create an **external managed MySQL 8 database** with a provider that allows connections from Render. Render's current managed database offering is PostgreSQL, not MySQL; do not expect Render to provision MySQL. Availability, backups, network/IP allow-list requirements, and pricing depend on the external provider. Use a paid production plan with backups and TLS for real users; do not use an ephemeral/free database for production. Set `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` using the provider's TLS JDBC connection details.
4. Run `database/schema.sql` against the new database, or apply an equivalent reviewed migration. Set `DDL_AUTO=validate` so the deployed app validates the schema and never creates, drops, or updates production tables automatically.
5. Set `JWT_SECRET` to a unique, securely generated value (at least 32 random bytes); `ADMIN_EMAIL` and `ADMIN_PASSWORD` to provision the first admin; `CORS_ALLOWED_ORIGIN` to the exact deployed frontend origin (for example `https://your-site.onrender.com`). Set the frontend's build-time `VITE_API_BASE_URL` to `https://your-api.onrender.com/api`.
6. Render web services can use a free compute plan for demos, but free web instances spin down after 15 minutes idle and may take about a minute to wake; they also have usage limits. A production-facing always-on backend requires an appropriate paid compute plan. Static sites can be deployed without a web-service compute plan. Check current Render and database-provider pricing before deploying.
7. After deployment, check `https://your-api.onrender.com/api/health`, then register a normal account and sign in with the separately bootstrapped administrator to exercise the app.

Render's current service configuration and free-plan constraints are documented at [Blueprint specification](https://render.com/docs/blueprint-spec), [Web Services](https://render.com/docs/web-services), [Free instances](https://render.com/docs/free), and [Pricing](https://render.com/pricing). Deployment has not been performed as part of this workspace setup.

## Screenshots

Add screenshots of the home page, catalog, member dashboard, and administration screens here after running the app locally. No screenshots are included yet.
