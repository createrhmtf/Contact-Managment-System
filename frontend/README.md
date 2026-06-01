# Nexa Contacts Frontend

React frontend for the Contact Management System.

## Run locally

Start the Spring Boot API from the repository root:

```powershell
mvnw.cmd spring-boot:run
```

Start the frontend from this directory:

```powershell
npm install
npm run dev
```

Open `http://localhost:5173`.

## Checks

```powershell
npm run lint
npm run build
```

Vite proxies `/api` requests to the Spring Boot API on port `8080`.
