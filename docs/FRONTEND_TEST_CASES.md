# Frontend Test Cases

These automated test cases cover the React user interface built for the Contact Management System.

## Run

```powershell
cd "F:\Agentic websites\CMS\contact-managment-system\frontend"
npm.cmd test
```

## Coverage map

| Area | Test IDs | File |
| --- | --- | --- |
| API client | TC-FE-API-01 to TC-FE-API-05 | `frontend/src/lib/api.test.js` |
| Formatting helpers | TC-FE-FMT-01 to TC-FE-FMT-04 | `frontend/src/lib/format.test.js` |
| Auth session management | TC-FE-AUTH-01 to TC-FE-AUTH-04 | `frontend/src/auth/AuthProvider.test.jsx` |
| Protected routing | TC-FE-ROUTE-01 to TC-FE-ROUTE-02 | `frontend/src/components/ProtectedRoute.test.jsx` |
| Login screen | TC-FE-LOGIN-01 to TC-FE-LOGIN-03 | `frontend/src/pages/LoginPage.test.jsx` |
| Registration screen | TC-FE-REGISTER-01 to TC-FE-REGISTER-03 | `frontend/src/pages/RegisterPage.test.jsx` |
| Contact form | TC-FE-CONTACT-FORM-01 to TC-FE-CONTACT-FORM-03 | `frontend/src/components/ContactForm.test.jsx` |
| Contacts dashboard | TC-FE-CONTACTS-01 to TC-FE-CONTACTS-07 | `frontend/src/pages/ContactsPage.test.jsx` |
| User profile | TC-FE-PROFILE-01 to TC-FE-PROFILE-04 | `frontend/src/pages/ProfilePage.test.jsx` |
| Password modal | TC-FE-PWD-01 to TC-FE-PWD-02 | `frontend/src/components/ChangePasswordModal.test.jsx` |

## Backend API additions

| Area | Test IDs | File |
| --- | --- | --- |
| Contact API | TC-CON-API-01 to TC-CON-API-08 | `src/test/java/com/cms/integration/ContactApiIntegrationTest.java` |
| User profile API | TC-PROFILE-API-01 to TC-PROFILE-API-03 | `src/test/java/com/cms/integration/UserProfileApiIntegrationTest.java` |
