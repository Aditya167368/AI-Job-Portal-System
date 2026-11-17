# The Aditya Coding

[![Firebase Hosting](https://img.shields.io/badge/Hosted%20on-Firebase-FFCA28)](https://console.firebase.google.com/project/the-aditya-coding/hosting)

This project is the **AI‑Powered Coding Interview Assistant** built with a Spring Boot backend, MongoDB, and a React frontend. It is now hosted on **Firebase Hosting** under the project ID `the-aditya-coding`.

---

## Getting Started

```bash
# Clone the repo
git clone <repo-url>

# Backend (Java)
cd backend
./mvnw spring-boot:run

# Frontend (React)
cd ../frontend
npm install
npm run dev
```

Visit the live site at: https://the-aditya-coding.web.app

## Backend configuration

Set the `JWT_SECRET` environment variable before starting the backend. Use a
private, randomly generated secret of at least 32 bytes; do not commit it to
the repository. The backend reads it from the environment through
`backend/src/main/resources/application.yml`.
