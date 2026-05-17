
##  Quick Start 

### 1. Set environment variable

Create a `Backend/.env` file and set all of those:

```env
GEMINI_API_KEY=
DB_ADMIN_USERNAME=
DB_ADMIN_PASSWORD=
VERTEX_MODEL=
GCP_PROJECT_ID=
GCP_LOCATION=
GOOGLE_SERVICE_ACCOUNT_JSON=
DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=
```

Create a `Frontend/.env` file and set all of those:

```env
NEXT_PUBLIC_WS_URL=
```

### 2. Build and run all services

```bash
docker compose up --build -d
```

### 3. Stop services

```bash
docker compose down
```

**Admin : localhost:3000/admin**  