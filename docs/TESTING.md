# Testing Guide — Contact Management System

## Overview

Tests use **JUnit 5**, **Mockito**, **AssertJ**, **Spring Boot Test**, and **Spring Security Test**.  
The `test` profile runs against **H2 in-memory** (no SQL Server required for CI/local test runs).

## Test layout

```
src/test/java/com/cms/
├── controller/          # @WebMvcTest — HTTP contract (mocked services)
├── integration/         # @SpringBootTest — full API + security + JPA
├── repository/          # @DataJpaTest — persistence layer
├── unit/
│   ├── entity/          # Pure entity/unit logic
│   ├── security/        # JwtUtil
│   └── service/         # AuthServiceImpl (mocked dependencies)
└── support/             # Shared fixtures, helpers, base classes
```

## Run tests

```powershell
cd "f:\Agentic websites\CMS\contact-managment-system"
.\mvnw.cmd test
```

Clean run:

```powershell
.\mvnw.cmd clean test
```

Single class:

```powershell
.\mvnw.cmd test -Dtest=AuthApiIntegrationTest
```

## Traceability

Integration and unit tests include `@DisplayName` values such as `TC-REG-01` aligned with the manual test plan (registration, login, password change, security, JWT, database).

## Configuration

| File | Purpose |
|------|---------|
| `src/test/resources/application-test.yml` | H2 datasource, JWT test secret |
| `src/main/resources/application.properties` | Production/dev SQL Server (not used in tests) |

## Layers

| Layer | Annotation | Example |
|-------|------------|---------|
| Unit (service) | `@ExtendWith(MockitoExtension.class)` | `AuthServiceImplTest` |
| Unit (JWT) | Plain JUnit | `JwtUtilTest` |
| Web | `@WebMvcTest` | `AuthControllerTest` |
| JPA | `@DataJpaTest` + `@ActiveProfiles("test")` | `UserRepositoryTest` |
| Integration | `@SpringBootTest` + `@ActiveProfiles("test")` | `AuthApiIntegrationTest` |
