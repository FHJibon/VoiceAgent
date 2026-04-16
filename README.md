
## ⚡ Quick Start 

### 1. Clone & Setup Backend Environment
```bash
cd Backend
python -m venv .venv
```
```bash
.venv\Scripts\activate
```
```bash
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create a `.env` file in the `Backend` directory:

```env
GEMINI_API_KEY=
DB_ADMIN_USERNAME=admin
DB_ADMIN_PASSWORD=change-me
```

### 3. Setup Frontend Environment
```bash
cd ../Frontend
npm install
```

### 4. Start Backend Server
```bash
cd ../Backend
.venv\Scripts\activate
uvicorn main:app --reload
```

### 5. Start Frontend Development Server
```bash
cd ../Frontend
npm run dev
```

**Frontend : http://localhost:3000**  
**Backend  : http://127.0.0.1:8000**  
**Database : http://127.0.0.1:8000/database**  
**API      : http://127.0.0.1:8000/docs**  

## Docker Deployment

### 1. Set environment variable

Create a root `.env` file from `.env.example` and set your Gemini key:

```env
GEMINI_API_KEY=your_real_key
DB_ADMIN_USERNAME=admin
DB_ADMIN_PASSWORD=change-me
FRONTEND_ORIGINS=http://localhost:3000,https://voiceagent.optovex.com
NEXT_PUBLIC_WS_URL=ws://YOUR_GCLOUD_EXTERNAL_IP:8000/ws
```

### 2. Build and run all services

```bash
docker compose up --build -d
```

### 3. Open services

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`
- Database UI: `http://localhost:8000/database`

### 4. Stop services

```bash
docker compose down
```