import psycopg2
import json
from typing import Optional, Dict, Any
from core.config import settings

class UserDatabase:
    def __init__(self):
        self.conn_str = f"host={settings.DB_HOST} port={settings.DB_PORT} dbname={settings.DB_NAME} user={settings.DB_USER} password={settings.DB_PASSWORD}"
        self.init_database()

    def get_connection(self):
        return psycopg2.connect(self.conn_str)
    
    def init_database(self):
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute('''
                        CREATE TABLE IF NOT EXISTS users (
                            id SERIAL PRIMARY KEY,
                            name TEXT NOT NULL,
                            phone TEXT NOT NULL UNIQUE,
                            job_title TEXT NOT NULL,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            session_data TEXT
                        );
                        CREATE TABLE IF NOT EXISTS form_sessions (
                            id SERIAL PRIMARY KEY,
                            session_id TEXT UNIQUE NOT NULL,
                            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                            form_data TEXT,
                            status TEXT DEFAULT 'in_progress',
                            started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            completed_at TIMESTAMP
                        );
                    ''')
                    conn.commit()
        except Exception:
            pass

    def get_all_users(self, limit: int = 100, offset: int = 0):
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute('SELECT id, name, phone, job_title, created_at, updated_at, session_data FROM users ORDER BY created_at DESC LIMIT %s OFFSET %s', (limit, offset))
                return [{"id": r[0], "name": r[1], "phone": r[2], "job_title": r[3], "created_at": r[4], "updated_at": r[5], "session_data": json.loads(r[6]) if r[6] else None} for r in cur.fetchall()]

    def get_user_count(self):
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute('SELECT COUNT(*) FROM users')
                return cur.fetchone()[0]

    def search_users(self, query: str):
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute('SELECT id, name, phone, job_title, created_at, updated_at, session_data FROM users WHERE name ILIKE %s OR job_title ILIKE %s ORDER BY created_at DESC', (f"%{query}%", f"%{query}%"))
                return [{"id": r[0], "name": r[1], "phone": r[2], "job_title": r[3], "created_at": r[4], "updated_at": r[5], "session_data": json.loads(r[6]) if r[6] else None} for r in cur.fetchall()]

    def get_user_by_id(self, user_id: int):
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute('SELECT id, name, phone, job_title, created_at, updated_at, session_data FROM users WHERE id = %s', (user_id,))
                r = cur.fetchone()
                return {"id": r[0], "name": r[1], "phone": r[2], "job_title": r[3], "created_at": r[4], "updated_at": r[5], "session_data": json.loads(r[6]) if r[6] else None} if r else None

    def get_user_by_phone(self, phone: str):
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute('SELECT id, name, phone, job_title, created_at, updated_at, session_data FROM users WHERE phone = %s', (phone,))
                r = cur.fetchone()
                return {"id": r[0], "name": r[1], "phone": r[2], "job_title": r[3], "created_at": r[4], "updated_at": r[5], "session_data": json.loads(r[6]) if r[6] else None} if r else None

    def get_recent_users(self, days: int):
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute('SELECT id, name, phone, job_title, created_at, updated_at, session_data FROM users WHERE created_at >= NOW() - (%s * INTERVAL \'1 day\') ORDER BY created_at DESC', (days,))
                return [{"id": r[0], "name": r[1], "phone": r[2], "job_title": r[3], "created_at": r[4], "updated_at": r[5], "session_data": json.loads(r[6]) if r[6] else None} for r in cur.fetchall()]

    def delete_user(self, user_id: int):
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute('DELETE FROM users WHERE id = %s', (user_id,))
                conn.commit()
                return cur.rowcount > 0

    def get_form_session_count(self):
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute('SELECT COUNT(*) FROM form_sessions')
                return cur.fetchone()[0]

    def save_form_session(self, session_id: str, form_data: Dict[str, Any], status: str):
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute('INSERT INTO form_sessions (session_id, form_data, status) VALUES (%s, %s, %s) ON CONFLICT (session_id) DO UPDATE SET form_data = EXCLUDED.form_data, status = EXCLUDED.status RETURNING id', (session_id, json.dumps(form_data), status))
                val = cur.fetchone()[0]
                conn.commit()
                return val

    def save_user_data(self, name: str, phone: str, job_title: str, session_data: Optional[Dict] = None):
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute('INSERT INTO users (name, phone, job_title, session_data) VALUES (%s, %s, %s, %s) ON CONFLICT (phone) DO UPDATE SET name = EXCLUDED.name, job_title = EXCLUDED.job_title, updated_at = CURRENT_TIMESTAMP, session_data = EXCLUDED.session_data RETURNING id', (name, phone, job_title, json.dumps(session_data) if session_data else None))
                val = cur.fetchone()[0]
                conn.commit()
                return val

    def complete_form_session(self, session_id: str, user_id: int):
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute('UPDATE form_sessions SET status = \'completed\', user_id = %s, completed_at = CURRENT_TIMESTAMP WHERE session_id = %s', (user_id, session_id))
                conn.commit()

db = UserDatabase()