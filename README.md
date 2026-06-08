# 📇 Contact Management System (CMS)

[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.0-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.2.6-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.0.12-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev)
[![Microsoft SQL Server](https://img.shields.io/badge/SQL_Server-2022-CC292B?style=for-the-badge&logo=microsoft-sql-server&logoColor=white)](https://www.microsoft.com/sql-server)
[![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](https://opensource.org/licenses/MIT)

A secure, enterprise-grade full-stack Contact Management System. The application allows users to register, log in securely with JWT authentication, and manage their contact directory. Contacts can have multiple emails, phone numbers, and addresses, completely categorized with custom labels (e.g., *Work*, *Home*, *Mobile*).

---

## 🌟 Key Features

### 🔒 Security & Auth
- **JWT-Based Authentication**: Stateless authentication with automatic token expiration and handling.
- **Role-Based Security**: Secured backend REST APIs using Spring Security 6.
- **Password Strength & Verification**: Strong password validation, change password functionality, and secure forgot-password flows.
- **Environment Driven**: Secrets and credentials managed entirely via environment variables.

### 📇 Contact Management
- **One-to-Many Relationships**: Each contact can store multiple phone numbers, emails, and notes.
- **Dynamic Search & Filtering**: Multi-field server-side search across contact name, title, company, emails, and phone numbers.
- **Pagination & Capping**: Efficient, performant paginated directories built with Spring Data Pageable.

### 📊 Dashboard & UI
- **Interactive Overview**: Real-time stats showing total contacts, recently added contacts (30d), and contacts with missing info.
- **Premium Design Aesthetics**: Harmonies of sleek dark sidebar components, modern Outfit/Inter typography, fluid micro-animations, and glassmorphic layouts.
- **Responsive Layout**: Designed for mobile, tablet, and desktop screens with custom breakpoints.

---

## 🛠️ Tech Stack

- **Backend**: Java 17, Spring Boot 3.3.0, Spring Security, JPA / Hibernate, JWT (jjwt 0.12.3)
- **Frontend**: React 19 (Vite, SPA), React Router 7, Tailwind/CSS Custom Tokens, Lucide Icons, Vitest
- **Database**: Microsoft SQL Server (for local and production) & H2 (for integration testing)
- **Testing**: JUnit 5, Mockito, Spring Data JPA Test, Vitest, JSDOM, Testing Library

---

## 🏗️ Architecture Overview

The application is structured following clean coding standards:

```mermaid
graph TD
    Client[React Frontend / SPA] -->|HTTP Requests / Bearer Token| Controller[UserController / ContactController]
    Controller -->|DTO| Service[UserService / ContactService]
    Service -->|Entities| Repository[UserRepository / ContactRepository]
    Repository -->|JPA / JDBC| DB[(SQL Server Database)]
    Filter[JwtAuthenticationFilter] -->|Validates Token| Controller
```

---

## 📁 Repository Structure

```
contact-management-system/
├── src/main/java/com/cms/
│   ├── config/            # App and Security configurations (CORS, Security Filter Chain)
│   ├── controller/        # REST Controllers (Endpoints definition)
│   ├── service/           # Business logic layer (Service Interfaces + Implementations)
│   ├── repository/        # Spring Data JPA repositories (Database communication)
│   ├── model/             # Database Entities (User, Contact, Phone, Email) & DTOs
│   ├── security/          # JWT tokens & Security filters
│   └── exception/         # Exception handling (GlobalExceptionHandler & Custom errors)
├── src/main/resources/
│   ├── application.properties         # Main backend database properties
│   └── application.properties.example # Example properties file
├── frontend/              # Single Page Application
│   ├── src/
│   │   ├── auth/          # Authentication context & provider
│   │   ├── components/    # Reusable UI elements (AppShell, Modals, Forms)
│   │   ├── pages/         # Page components (Dashboard, Contacts, Profile, Login)
│   │   └── lib/           # Utility functions (API client, formatters)
│   └── vite.config.js     # Vite configuration (includes local API proxying)
├── database/
│   └── create-schema.sql  # SQL Database creation script
└── scripts/
    └── run-local.ps1      # PowerShell helper command
```

---

## 🚀 Getting Started

### 1. Database Setup

Create the database and a dedicated SQL Server login:

```sql
CREATE DATABASE contact_db;
GO

CREATE LOGIN cms_user WITH PASSWORD = 'CmsPass123!';
GO

USE contact_db;
GO

CREATE USER cms_user FOR LOGIN cms_user;
ALTER ROLE db_datareader ADD MEMBER cms_user;
ALTER ROLE db_datawriter ADD MEMBER cms_user;
ALTER ROLE db_ddladmin  ADD MEMBER cms_user;
GO
```

Initialize the database schema using our script:
```powershell
sqlcmd -S localhost -d contact_db -U cms_user -P CmsPass123! -i database/create-schema.sql
```

### 2. Run the Backend

Configure your environment variables (or copy `src/main/resources/application.properties.example` into your own `application.properties`).

**Windows (PowerShell):**
```powershell
$env:DB_USERNAME = "cms_user"
$env:DB_PASSWORD = "CmsPass123!"
$env:JWT_SECRET  = "YourCustomLongJWTSecretKeySignatureAtLeast32Bytes"
.\mvnw.cmd spring-boot:run
```

**macOS / Linux:**
```bash
export DB_USERNAME=cms_user
export DB_PASSWORD=CmsPass123!
export JWT_SECRET=YourCustomLongJWTSecretKeySignatureAtLeast32Bytes
./mvnw spring-boot:run
```

*The API will be available at:* **`http://localhost:8080`**

### 3. Run the Frontend

Navigate to the frontend folder, install dependencies, and start Vite:

```bash
cd frontend
npm install
npm run dev
```

*The UI will be available at:* **`http://localhost:5173`**

---

## 🧪 Running Tests

### Backend Tests (JUnit 5 + Mockito + H2)
Runs all 64 integration & unit tests:
```powershell
.\mvnw.cmd test
```

### Frontend Tests (Vitest + Testing Library)
Runs all 40 UI tests:
```bash
cd frontend
npm test
```

---

## 🛡️ QA & Bug Fix Status (100% Fixed)

All bugs, vulnerabilities, and code quality issues identified in the QA assessment report have been completely addressed:

| Ticket ID | Category | Description | Status |
|-----------|----------|-------------|--------|
| **BUG-001** | Critical | Fixed `ContactServiceImpl.getAllContacts()` signature to match interface | ✅ Resolved |
| **BUG-002** | Critical | Fixed `searchContactsByKeyword` repository typo | ✅ Resolved |
| **SEC-001** | High | Removed hardcoded credentials; replaced with dynamic environment variables | ✅ Resolved |
| **SEC-002** | High | Created security configuration example template file | ✅ Resolved |
| **SEC-003** | High | Replaced default `sa` DB username with the limited-privilege `cms_user` | ✅ Resolved |
| **ARC-001** | High | Extracted repository logic from `UserController` into `UserService` layer | ✅ Resolved |
| **BUG-003** | Medium | Extended search functionality to cover contact phone numbers | ✅ Resolved |
| **BUG-004** | Medium | Added auto-intercept on 401 Unauthorized API requests | ✅ Resolved |
| **BUG-006** | Medium | Applied the `cappedSize` pagination cap | ✅ Resolved |
| **UI-001** | Medium | Removed non-functional placeholder filter/sort buttons | ✅ Resolved |
| **UI-002** | Medium | Replaced dashboard trend badges and hardcoded logs with real contacts | ✅ Resolved |
| **UI-003** | Medium | Removed unused checkboxes from the Contacts list view | ✅ Resolved |
| **QA-004** | Low | Changed database address/notes columns to `NVARCHAR(MAX)` | ✅ Resolved |
| **QA-005** | Low | Standardized file line-endings to LF via `.gitattributes` | ✅ Resolved |
| **QA-006** | Low | Removed dummy notification options on Profile Page | ✅ Resolved |

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.