# Postman Testing Guide — Authentication & Core Backend (Phase 2)

This guide provides end-to-end instructions for testing all Authentication and Core Backend endpoints in Postman.

---

## 1. Prerequisites & Setup

### Start the Backend Server
Make sure PostgreSQL is running and start the backend:
```bash
cd server
npm run dev
```
The server will start at:
```text
http://localhost:5000
```

### Postman Environment / Collection Variables
In Postman, create an Environment or set Collection Variables:
* `baseUrl`: `http://localhost:5000`
* `accessToken`: *(populated automatically or manually after login)*

---

## 2. Test Cases Overview

| # | Endpoint | Method | Auth Required | Expected Status | Purpose |
|---|---|---|---|---|---|
| 1 | `/api/auth/register` | `POST` | None | `201 Created` | Register new user & set cookie |
| 2 | `/api/auth/register` | `POST` | None | `409 Conflict` | Check duplicate email rejection |
| 3 | `/api/auth/register` | `POST` | None | `400 Bad Request` | Test Zod input validation |
| 4 | `/api/auth/login` | `POST` | None | `200 OK` | Login user & issue tokens |
| 5 | `/api/auth/login` | `POST` | None | `401 Unauthorized` | Reject invalid password |
| 6 | `/api/auth/me` | `GET` | Bearer Token | `200 OK` | Fetch authenticated user profile |
| 7 | `/api/auth/me` | `GET` | None | `401 Unauthorized` | Reject unauthenticated request |
| 8 | `/api/auth/refresh` | `POST` | Cookie | `200 OK` | Issue new access token via cookie |
| 9 | `/api/auth/admin-check` | `GET` | Bearer Token | `403 Forbidden` | Verify `requireAdmin` blocks CUSTOMER |
| 10 | `/api/auth/logout` | `POST` | None | `200 OK` | Clear refresh token cookie |

---

## 3. Step-by-Step Requests

### 1. Register User
* **Method**: `POST`
* **URL**: `{{baseUrl}}/api/auth/register`
* **Headers**:
  * `Content-Type: application/json`
* **Body** (`raw` → `JSON`):
  ```json
  {
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "password": "Password123!",
    "phone": "9876543210"
  }
  ```
* **Postman Test Script** *(Optional - paste in Postman "Tests" tab)*:
  ```javascript
  pm.test("Status code is 201", function () {
      pm.response.to.have.status(201);
  });
  const jsonData = pm.response.json();
  if (jsonData.data && jsonData.data.accessToken) {
      pm.environment.set("accessToken", jsonData.data.accessToken);
  }
  ```
* **Expected Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "accessToken": "eyJhbGciOi...",
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "phone": "9876543210",
        "role": "CUSTOMER",
        "isActive": true,
        "createdAt": "2026-09-28T11:15:00.000Z"
      }
    }
  }
  ```
* **Verification Checks**:
  1. `role` is strictly `"CUSTOMER"`.
  2. `password` and `passwordHash` are NOT returned.
  3. Look at the **Cookies** tab in Postman: `refreshToken` is present with `HttpOnly` enabled.

---

### 2. Duplicate Email Check
* **Method**: `POST`
* **URL**: `{{baseUrl}}/api/auth/register`
* **Headers**:
  * `Content-Type: application/json`
* **Body** (`raw` → `JSON`):
  * Send the exact same body as Step 1 (`jane.doe@example.com`).
* **Expected Response (`409 Conflict`)**:
  ```json
  {
    "success": false,
    "message": "An account with this email already exists"
  }
  ```

---

### 3. Zod Input Validation Check
* **Method**: `POST`
* **URL**: `{{baseUrl}}/api/auth/register`
* **Headers**:
  * `Content-Type: application/json`
* **Body** (`raw` → `JSON`):
  ```json
  {
    "name": "J",
    "email": "not-an-email",
    "password": "123"
  }
  ```
* **Expected Response (`400 Bad Request`)**:
  ```json
  {
    "success": false,
    "message": "Validation failed",
    "errors": [
      {
        "field": "name",
        "message": "Name must be at least 2 characters long"
      },
      {
        "field": "email",
        "message": "Invalid email address format"
      },
      {
        "field": "password",
        "message": "Password must be at least 6 characters long"
      }
    ]
  }
  ```

---

### 4. User Login
* **Method**: `POST`
* **URL**: `{{baseUrl}}/api/auth/login`
* **Headers**:
  * `Content-Type: application/json`
* **Body** (`raw` → `JSON`):
  ```json
  {
    "email": "jane.doe@example.com",
    "password": "Password123!"
  }
  ```
* **Postman Test Script** *(Optional - paste in Postman "Tests" tab)*:
  ```javascript
  pm.test("Status code is 200", function () {
      pm.response.to.have.status(200);
  });
  const jsonData = pm.response.json();
  if (jsonData.data && jsonData.data.accessToken) {
      pm.environment.set("accessToken", jsonData.data.accessToken);
  }
  ```
* **Expected Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "accessToken": "eyJhbGciOi...",
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "phone": "9876543210",
        "role": "CUSTOMER",
        "isActive": true,
        "createdAt": "2026-09-28T11:15:00.000Z"
      }
    }
  }
  ```
* **Verification Checks**:
  1. `accessToken` is returned in JSON for frontend `localStorage`.
  2. `refreshToken` is saved in the browser/Postman cookie jar (not in JSON).

---

### 5. Login with Invalid Credentials
* **Method**: `POST`
* **URL**: `{{baseUrl}}/api/auth/login`
* **Headers**:
  * `Content-Type: application/json`
* **Body** (`raw` → `JSON`):
  ```json
  {
    "email": "jane.doe@example.com",
    "password": "WrongPassword999!"
  }
  ```
* **Expected Response (`401 Unauthorized`)**:
  ```json
  {
    "success": false,
    "message": "Invalid email or password"
  }
  ```

---

### 6. Get Current User Profile (`/me`)
* **Method**: `GET`
* **URL**: `{{baseUrl}}/api/auth/me`
* **Headers**:
  * `Authorization: Bearer {{accessToken}}`
* **Expected Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Current user profile fetched successfully",
    "data": {
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "phone": "9876543210",
        "role": "CUSTOMER",
        "isActive": true,
        "createdAt": "2026-09-28T11:15:00.000Z"
      }
    }
  }
  ```

---

### 7. Get Current User Without Token (Unauthorized)
* **Method**: `GET`
* **URL**: `{{baseUrl}}/api/auth/me`
* **Headers**:
  * Do NOT include the `Authorization` header.
* **Expected Response (`401 Unauthorized`)**:
  ```json
  {
    "success": false,
    "message": "Authentication required. Please provide a valid Bearer token"
  }
  ```

---

### 8. Refresh Access Token
* **Method**: `POST`
* **URL**: `{{baseUrl}}/api/auth/refresh`
* **Headers**:
  * None required (Postman automatically sends cookies for `localhost`).
* **Body**: None
* **Expected Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Token refreshed successfully",
    "data": {
      "accessToken": "eyJhbGciOi..."
    }
  }
  ```
* **Verification Checks**:
  1. A new access token is returned.
  2. The refresh token remains inside the cookie.

---

### 9. Test Admin Authorization Protection (`requireAdmin`)
* **Method**: `GET`
* **URL**: `{{baseUrl}}/api/auth/admin-check`
* **Headers**:
  * `Authorization: Bearer {{accessToken}}` *(Token of a CUSTOMER user)*
* **Expected Response (`403 Forbidden`)**:
  ```json
  {
    "success": false,
    "message": "Forbidden: Admin privileges required to access this resource"
  }
  ```
* **Verification Checks**:
  1. `requireAuth` permits the request because the token is valid.
  2. `requireAdmin` checks `req.user.role` and returns `403` because role is not `ADMIN`.

---

### 10. Logout User
* **Method**: `POST`
* **URL**: `{{baseUrl}}/api/auth/logout`
* **Headers**: None
* **Body**: None
* **Expected Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Logout successful"
  }
  ```
* **Verification Checks**:
  1. Postman Cookies tab: The `refreshToken` cookie is cleared/expired.
  2. Subsequent calls to `POST /api/auth/refresh` will return `401 Unauthorized` (`Refresh token is missing`).

---

## 4. Summary of Key Architectural Rules Verified

* [x] **No password hash leakage**: Passwords and hashes are omitted from all responses.
* [x] **Separation of tokens**: Access token in JSON response; refresh token in HTTP-only cookie.
* [x] **Role security**: Public registration defaults to `CUSTOMER`; passing `role: "ADMIN"` is ignored/prevented.
* [x] **Token lifetimes**: Access token expires in `5h`; refresh token in `7d`.
* [x] **Global error formatting**: All error responses return `{ "success": false, "message": "...", "errors": [...] }`.
