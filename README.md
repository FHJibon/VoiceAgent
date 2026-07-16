# Voice-Enabled Form Engine

**Voice-Enabled Form Engine** is a real-time conversational agent system built with **FastAPI**, **Next.js**, **Pipecat AI**, **Google Gemini (Vertex AI)**, and **PostgreSQL** that combines a real-time voice conversational pipeline, interactive live-updating web form, and an administrative control panel.

---

# Features

1. **Real-Time Voice Assistant**: Full-duplex voice conversation via WebSockets, allowing smooth interaction with the AI assistant.
2. **Intent-Driven Form Updates**: Uses function calling to extract `name`, `phone`, and `jobTitle` from conversations.
3. **Live UI Synchronization**: Instantly fills fields in the user's frontend view as the user speaks.
4. **CRM Database Persistence**: Securely stores and manages completed forms and ongoing sessions in PostgreSQL.
5. **Interactive Dashboard**: Administrative screen showing active session counts and total registrants.
6. **Robust Search & Management**: Full CRUD interface for viewing, searching, and deleting collected user profiles.
7. **Basic Auth Protection**: Restricts administrative endpoints and stats behind a secure Basic Authentication guard.
8. **Speech Synthesis & Recognition**: Integrates standard Web Speech API to recognize speech and play response voice streams dynamically.

---

# System Architecture

<div align="center">

**User Voice / Chat**
<br>↓<br>
**Next.js Frontend**
<br>↓<br>
**WebSocket Connection**
<br>↓<br>
**FastAPI Backend**
<br>↓<br>
**Pipecat Pipeline Loop**
<br>↓<br>
**Gemini LLM (Vertex AI)**
<br>↓<br>
**Form Manager Tool**
<br>↓<br>
**PostgreSQL Database**

</div>

---

# Implementation Details

1. **Establishing a Real-Time Open Connection (WebSockets)**:
   When you open the web page, it creates a persistent, two-way communication channel (called a WebSocket) to the server. Think of it like a phone call that stays active so that both sides can speak and send data immediately without having to refresh the page.
   
2. **Guidelines and Memory (The Prompt Context)**:
   The backend pipeline creates a session memory and loads a set of rules for the AI. This acts like a script that tells the assistant: *"Be helpful, ask for the user's name, phone number, and job title, and save them as they are mentioned."*

3. **Smart Action Detection (Function & Tool Calling)**:
   As you speak or chat, Google's Gemini AI listens to your words. If you say *"My name is Jibon"*, the AI is smart enough to recognize that this is a name. Rather than just replying, it triggers an action (a "tool call") to save "Jibon" into the "name" field.
   
4. **Instant Screen Updates (State Synchronization)**:
   The moment the AI saves a detail, it sends a message back through the active connection to the website. The website instantly fills in the corresponding box on your screen. You see the form autofill in real time as you talk!

---

## Where Data is Stored (Database)

Any information collected is saved securely in a database:
- **User Records (`users`)**: Once you confirm your details are correct, they are saved as a completed profile in a permanent database table.
- **Active Sessions (`form_sessions`)**: The system also remembers draft submissions. If the conversation gets interrupted halfway, your progress is saved so you can resume where you left off.

---

## Speaking and Listening (Web Speech Integration)

To make it a true voice assistant, the system uses features built directly into your web browser:
- **Listening**: The browser records your voice and converts it to text, sending it over the open link.
- **Speaking (Speech Synthesis)**: The browser reads the assistant's text answers out loud using a natural-sounding voice.

---

# Tech Stack

<div align="center">
  <table width="85%" style="border-collapse: collapse; border: 1px solid #ccc;">
    <thead>
      <tr style="border-bottom: 2px solid #ccc;">
        <th align="left" style="padding: 8px; border-right: 1px solid #ccc;">Component</th>
        <th align="left" style="padding: 8px;">Technology</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1px solid #eee;">
        <td align="left" style="padding: 8px; border-right: 1px solid #ccc;"><strong>Backend</strong></td>
        <td align="left" style="padding: 8px;">FastAPI (Python)</td>
      </tr>
      <tr style="border-bottom: 1px solid #eee;">
        <td align="left" style="padding: 8px; border-right: 1px solid #ccc;"><strong>Frontend</strong></td>
        <td align="left" style="padding: 8px;">Next.js, React, TypeScript</td>
      </tr>
      <tr style="border-bottom: 1px solid #eee;">
        <td align="left" style="padding: 8px; border-right: 1px solid #ccc;"><strong>Conversational Pipeline</strong></td>
        <td align="left" style="padding: 8px;">Pipecat AI</td>
      </tr>
      <tr style="border-bottom: 1px solid #eee;">
        <td align="left" style="padding: 8px; border-right: 1px solid #ccc;"><strong>LLM Service</strong></td>
        <td align="left" style="padding: 8px;">Google Gemini (Vertex AI LLM)</td>
      </tr>
      <tr style="border-bottom: 1px solid #eee;">
        <td align="left" style="padding: 8px; border-right: 1px solid #ccc;"><strong>Database</strong></td>
        <td align="left" style="padding: 8px;">PostgreSQL (psycopg2)</td>
      </tr>
      <tr style="border-bottom: 1px solid #eee;">
        <td align="left" style="padding: 8px; border-right: 1px solid #ccc;"><strong>Styling</strong></td>
        <td align="left" style="padding: 8px;">TailwindCSS</td>
      </tr>
      <tr>
        <td align="left" style="padding: 8px; border-right: 1px solid #ccc;"><strong>Containerization</strong></td>
        <td align="left" style="padding: 8px;">Docker & Docker Compose</td>
      </tr>
    </tbody>
  </table>
</div>

---

# Setup Guide

## Prerequisites

1. Docker
2. Google Cloud Platform (GCP)

---

## Environment Variables

Configure application settings by setting up environment files.

### Backend Configuration

Create a `Backend/.env` file with these values:

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
FRONTEND_ORIGINS=
```

### Frontend Configuration

Create a `Frontend/.env` file:

```env
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

---

## Run with Docker

Build and run all services in the background using `docker-compose.yml`:

```bash
docker compose up --build -d
```

Stop all containers and networks:

```bash
docker compose down
```

---

## How to Access the System

Once the services are successfully running via Docker:

* **Voice Agent Web Interface**: Open [http://localhost:3000](http://localhost:3000) in your web browser. This is the main interactive screen where users speak or chat with the assistant to fill out the form.
* **Admin Dashboard**: Open [http://localhost:3000/admin](http://localhost:3000/admin) in your web browser to log in, search, manage user records, and view system stats.
* **Backend API Documentation (Technical)**: For developer reference, the interactive Swagger specifications are available at [http://localhost:8000/docs](http://localhost:8000/docs).


# API Endpoints

## Real-Time WebSocket Channel

`GET/WS /ws`

Establishes a WebSocket connection to stream chat history, welcome messages, and dynamic state updates.

### Supported WS Frames:
- **Client to Server**:
  ```json
  {
    "type": "chat",
    "message": "Hi, my name is John Doe"
  }
  ```
- **Server to Client (Form updates)**:
  ```json
  {
    "type": "form_update",
    "field": "name",
    "value": "John Doe"
  }
  ```

---

## Admin Controls & Operations (Non-Technical Explanation)

These features are securely locked behind an admin login (username and password) to ensure only authorized personnel can access them. Through the admin panel, you can perform the following actions:

* **View All Registered Users**: Opens a complete list of all users who have submitted the form.
* **Filter Recent Registrations**: Checks and lists users who signed up within a specific timeframe (e.g., in the last 7 days).
* **Look Up Specific Users**:
  * By their database ID number.
  * By their phone number.
* **Delete User Profiles**: Permanently removes a person's registration details from the system (for security or data privacy requests).
* **View Dashboard Statistics**: Gathers overall stats including the total number of users, users who joined today, the total number of chatbot sessions, and database connection status.

---

# Error Handling

The application handles:
1. Invalid GCP Service Account configurations
2. Disconnected database states
3. Missing environment variables
4. Web Speech API synthesis or browser level voice errors
5. Unauthorized admin dashboard access attempts
6. Duplicate key violations (e.g. unique phone numbers constraint)

---

# About Me

**Author**: Ferdous Hasan  
**Date**: July 16, 2026