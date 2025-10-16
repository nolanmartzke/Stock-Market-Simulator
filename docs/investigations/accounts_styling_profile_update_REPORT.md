# Investigation Report: Accounts Page Styling + Profile Update Flow

**Date:** October 16, 2025  
**Branch:** feat/accounts-styling-and-profile-update  
**Investigator:** Team 8

---

## Summary

- **Current Accounts page is minimal** (read-only): displays name/email from localStorage, has logout button, uses inline styles (no modern design system integration)
- **No update endpoints exist**: Backend has NO PUT/PATCH endpoints for updating user name or password
- **Security critical**: Passwords stored in **plaintext** in database and transmitted/compared without hashing
- **Auth is localStorage-based**: No JWT tokens, no session validation, full User object (including plaintext password) stored in localStorage after login
- **Styling is Bootstrap-based with inline overrides**: SignIn/SignUp use Bootstrap 5 + Framer Motion + Lucide React icons with card-based layouts, rounded borders (20px/12px), and animated status feedback
- **No form validation or toast notifications**: Current Account page lacks any update UI, error handling, or user feedback mechanisms
- **No DTOs**: Backend returns full User entity (including password field) in all responses
- **Frontend uses React Context (AuthContext)**: Auth state managed via Context API + localStorage, no API client methods for profile updates

**Implication:** To deliver profile update functionality, we need:

1. NEW backend endpoints (PUT /api/users/{id} for name, PUT /api/users/{id}/password for password)
2. Password hashing (BCrypt or similar)
3. Current password verification for password changes
4. Request/Response DTOs to exclude password from responses
5. Frontend form UI matching existing Bootstrap/Framer Motion patterns
6. API client methods in AuthAPI.jsx
7. Success/error state handling with animated feedback (matching SignIn/SignUp patterns)

---

## Frontend Findings

### Files and Components for Accounts Page

| File Path                                     | Purpose                                                               |
| --------------------------------------------- | --------------------------------------------------------------------- |
| `/frontend/src/pages/Account.jsx`             | Main Accounts page component (currently read-only display)            |
| `/frontend/src/context/AuthContext.jsx`       | Auth state management (React Context), login/logout functions         |
| `/frontend/src/api/AuthAPI.jsx`               | Axios API client for auth endpoints (currently only signup/login)     |
| `/frontend/src/components/ProtectedRoute.jsx` | Route protection wrapper (checks localStorage for auth)               |
| `/frontend/src/App.jsx`                       | Route definitions (Account at `/account` with ProtectedRoute wrapper) |

### Route(s) and Protection

- **Route:** `/account` (defined in `App.jsx:30`)
- **Protection:** Wrapped in `<ProtectedRoute>` component
  - Checks `localStorage.getItem("auth")` for presence of auth object
  - Redirects to `/signin` if not authenticated
  - No server-side session validation or JWT verification

### Current Styling System

**Stack:**

- **Bootstrap 5** (v5.3.8) - CSS framework
- **Framer Motion** (v12.23.22) - animations
- **Lucide React** (v0.545.0) - icon library

**Current Account.jsx Styling:**

- Uses **inline styles** only (no Bootstrap classes)
- Simple box with border: `{ maxWidth: 400, margin: '50px auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }`
- No card component, no icons, no animations

**Pattern from SignIn/SignUp:**

- **Card-based layout**: `card shadow-lg border-0` with `borderRadius: "20px"`
- **Form controls**: `form-control form-control-lg` with `borderRadius: "12px"`
- **Button animations**: Framer Motion `whileTap={{ scale: 0.95 }}` and animated status feedback
- **Status colors**: Bootstrap CSS variables (`var(--bs-primary)`, `var(--bs-success)`, `var(--bs-danger)`)
- **Icons**: Lucide React icons (User, Lock, LogIn, UserPlus, etc.)
- **Layout**: Centered with `min-vh-100 bg-light d-flex align-items-center`, responsive columns (`col-md-6 col-lg-5 col-xl-4`)

**Shared UI Components to Reuse:**

- Bootstrap card structure with shadow and rounded corners
- Form labels with inline icons (`<User className="me-2" size={16} />`)
- Animated buttons with status-based color changes
- AnimatePresence for smooth text transitions

### How User Data is Loaded and Updated

**Loading:**

1. On mount, `Account.jsx` reads `auth` from `AuthContext` (line 8)
2. `AuthContext` loads from `localStorage.getItem("auth")` on initial render (line 12 in AuthContext.jsx)
3. Auth object contains: `{ id, name, email, password, createdAt, lastLoginAt }` (full User entity from backend)

**Current Update Flow:**

- **None exists** - page is read-only display
- No input fields, no API calls, no state mutations

**Expected Update Flow (to implement):**

1. User edits name/password in form
2. Call new API methods (e.g., `updateName()`, `updatePassword()`) from AuthAPI.jsx
3. On success, update AuthContext and localStorage with new user data (excluding password)
4. Display animated success feedback (matching SignIn/SignUp pattern)

---

## API Findings

### Existing Endpoints for Profile Updates

| Endpoint        | Method | Status      | Notes              |
| --------------- | ------ | ----------- | ------------------ |
| Update name     | N/A    | **MISSING** | No endpoint exists |
| Update password | N/A    | **MISSING** | No endpoint exists |

**Current User-related endpoints (UserController.java):**

| Endpoint            | Method | Request Body                | Response                          | Status Codes                                                     |
| ------------------- | ------ | --------------------------- | --------------------------------- | ---------------------------------------------------------------- |
| `/api/users/signup` | POST   | `{ email, password, name }` | Full User entity (incl. password) | 201 Created, 409 Conflict (duplicate email)                      |
| `/api/users/login`  | POST   | `{ email, password }`       | Full User entity (incl. password) | 200 OK, 401 Unauthorized (bad password), 404 Not Found (no user) |
| `/api/users/all`    | GET    | None                        | Array of full User entities       | 200 OK                                                           |

### Request/Response Shapes and Status Codes

**Current Response Shape (User entity):**

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123", // ⚠️ PLAINTEXT in response
  "createdAt": "2025-10-01T12:00:00",
  "lastLoginAt": "2025-10-16T08:30:00"
}
```

**Proposed DTOs:**

**UpdateNameRequest:**

```json
{
  "name": "New Name"
}
```

**UpdatePasswordRequest:**

```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456"
}
```

**UserResponse (DTO to exclude password):**

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2025-10-01T12:00:00",
  "lastLoginAt": "2025-10-16T08:30:00"
}
```

**Error Response Shape (to standardize):**

```json
{
  "error": "Invalid current password",
  "timestamp": "2025-10-16T10:15:30"
}
```

### Auth Mechanism

- **Current:** No auth mechanism (no JWT, no session cookies, no bearer tokens)
- **Frontend:** Stores full User object in localStorage after login/signup
- **Backend:** No authentication headers checked, no authorization filters
- **CORS:** Hardcoded `@CrossOrigin(origins = "http://localhost:5173")` on UserController

### Password Handling

**Current Implementation (CRITICAL SECURITY ISSUES):**

1. **Storage:** Plaintext in database (User.java:31-32, no hashing)

   ```java
   @Column(nullable = false)
   private String password;
   ```

2. **Comparison:** Plaintext string comparison (UserController.java:49)

   ```java
   if (!user.getPassword().equals(loginRequest.getPassword())) {
   ```

3. **Transmission:** Password sent in responses (lines 30-31, 57 in UserController.java)

4. **Validation:** None (no length requirements, no complexity checks)

**Required Changes:**

- **Hashing algorithm:** Use BCrypt (Spring Security's BCryptPasswordEncoder)
- **Old password verification:** Required for password updates
- **Validations:**
  - Minimum length (8+ chars)
  - Optional complexity rules (uppercase, lowercase, digit, special char)
- **Response filtering:** NEVER return password field in API responses

---

## Gaps & Risks

### Missing Endpoints or Validations

**Backend:**

- ❌ PUT `/api/users/{id}` (update name)
- ❌ PUT `/api/users/{id}/password` (update password)
- ❌ Password hashing (BCrypt)
- ❌ Current password verification for updates
- ❌ Input validation (name length, password strength)
- ❌ UserResponse DTO (to exclude password from responses)
- ❌ Error response DTOs (standardized error shapes)

**Frontend:**

- ❌ Update form UI in Account.jsx
- ❌ API client methods (`updateName`, `updatePassword`) in AuthAPI.jsx
- ❌ Form validation (client-side)
- ❌ State management for edit mode vs view mode
- ❌ Success/error feedback (matching SignIn/SignUp patterns)

### Security Concerns

| Risk                  | Current State                               | Required Mitigation                                 |
| --------------------- | ------------------------------------------- | --------------------------------------------------- |
| Plaintext passwords   | Stored and transmitted in clear             | Implement BCrypt hashing (min cost factor 10)       |
| Password in responses | Full User entity returned                   | Create UserResponse DTO, exclude password field     |
| No auth on endpoints  | Anyone can call `/api/users/all`            | Add Spring Security with JWT or session-based auth  |
| CORS hardcoded        | Only localhost:5173 allowed                 | Move to application.properties with env variables   |
| No rate limiting      | Unlimited login/update attempts             | Add rate limiting (e.g., Bucket4j or Redis-based)   |
| Email enumeration     | 404 vs 401 on login reveals email existence | Return generic "Invalid credentials" for both cases |
| No CSRF protection    | State-changing operations unprotected       | Add CSRF tokens (if using session auth)             |
| localStorage for auth | XSS can steal auth data                     | Consider httpOnly cookies for production            |

### UX Constraints

- **No toast/notification system:** Success/error feedback currently embedded in button text (SignIn/SignUp pattern) - continue this pattern or add a toast library (e.g., react-hot-toast)
- **No loading states in Account.jsx:** Need spinners or skeleton loaders during API calls
- **No form validation library:** Manual validation or add react-hook-form/Formik for consistency
- **No confirmation modals:** Password changes should require confirmation dialog
- **No "view password" toggle:** Modern UX expects password visibility toggle

---

## Minimal Plan to Deliver the Story

### Backend Tasks

**1. Create DTOs (new package: `team8.backend.dto`)**

- `UpdateNameRequest.java` (fields: `name`)
- `UpdatePasswordRequest.java` (fields: `currentPassword`, `newPassword`)
- `UserResponse.java` (fields: `id`, `name`, `email`, `createdAt`, `lastLoginAt`)
- `ErrorResponse.java` (fields: `error`, `timestamp`)

**2. Add Password Hashing**

- Add Spring Security dependency to `build.gradle`:
  ```gradle
  implementation 'org.springframework.boot:spring-boot-starter-security'
  ```
- Create `team8.backend.config.SecurityConfig.java`:
  - Disable default security (permit all for now, add auth later)
  - Provide `BCryptPasswordEncoder` bean
- Update `UserController.signup()`: Hash password before saving
- Update `UserController.login()`: Use `passwordEncoder.matches()` for comparison

**3. Create Profile Update Endpoints in UserController**

- `PUT /api/users/{id}` - update name
  - Request: `UpdateNameRequest`
  - Response: `UserResponse`
  - Status: 200 OK, 404 Not Found
- `PUT /api/users/{id}/password` - update password
  - Request: `UpdatePasswordRequest`
  - Response: 204 No Content
  - Status: 204 Success, 400 Bad Request (validation), 401 Unauthorized (wrong current password), 404 Not Found

**4. Update Existing Endpoints to Use DTOs**

- Modify `/signup` and `/login` to return `UserResponse` instead of User entity
- Add mapper utility or manual mapping in controller

**5. Add Validation**

- Add `spring-boot-starter-validation` dependency
- Annotate DTOs with `@NotNull`, `@NotBlank`, `@Size`, `@Email`, etc.
- Handle validation exceptions with `@ExceptionHandler` in controller

**Files to Touch/Add:**

- NEW: `src/main/java/team8/backend/dto/UpdateNameRequest.java`
- NEW: `src/main/java/team8/backend/dto/UpdatePasswordRequest.java`
- NEW: `src/main/java/team8/backend/dto/UserResponse.java`
- NEW: `src/main/java/team8/backend/dto/ErrorResponse.java`
- NEW: `src/main/java/team8/backend/config/SecurityConfig.java`
- MODIFY: `src/main/java/team8/backend/controller/UserController.java` (add 2 new endpoints, update existing)
- MODIFY: `build.gradle` (add dependencies)

### Frontend Tasks

**1. Update API Client (AuthAPI.jsx)**

- Add `updateName(userId, name)` - calls `PUT /api/users/{id}`
- Add `updatePassword(userId, currentPassword, newPassword)` - calls `PUT /api/users/{id}/password`

**2. Redesign Account.jsx**

- Replace inline styles with Bootstrap card structure (matching SignIn/SignUp)
- Add state: `editMode` (boolean), `newName`, `currentPassword`, `newPassword`, `status` (idle|loading|success|error)
- Add two sections:
  - **View Mode:** Display name/email with "Edit Profile" button
  - **Edit Mode:**
    - Name input field (pre-filled)
    - "Change Password" expandable section
    - Save/Cancel buttons with Framer Motion animations
- Implement form submission handlers
- Update AuthContext on successful name change

**3. Add Form Validation**

- Name: required, max 100 chars
- Password: required, min 8 chars, must match confirmation (add confirm field)
- Display validation errors below inputs (Bootstrap `invalid-feedback`)

**4. Add Status Feedback**

- Use animated button pattern from SignIn/SignUp
- Status states: idle|loading|success|nameError|passwordError|networkError
- Color-coded button with text changes (matching existing pattern)

**Files to Touch/Add:**

- MODIFY: `src/api/AuthAPI.jsx` (add 2 new functions)
- MODIFY: `src/pages/Account.jsx` (complete redesign)
- MODIFY: `src/context/AuthContext.jsx` (add `updateUser` function to update context state)

### Styling Approach

**Follow Existing Patterns (per STYLE.md and observed conventions):**

1. **Layout:**

   - Use Bootstrap grid: `container > row justify-content-center > col-md-8 col-lg-6`
   - Full-height background: `min-vh-100 bg-light d-flex align-items-center`

2. **Card Structure:**

   - Outer card: `card shadow-lg border-0` with `borderRadius: "20px"`
   - Padding: `card-body p-4` or `p-5`

3. **Form Elements:**

   - Labels: `form-label fw-medium text-dark` with Lucide icon (`<User className="me-2" size={16} />`)
   - Inputs: `form-control form-control-lg` with `borderRadius: "12px"`
   - Buttons: `btn btn-primary w-100 fw-medium` with `borderRadius: "12px"`

4. **Animations:**

   - Button tap: `whileTap={{ scale: 0.95 }}`
   - Success pulse: `animate={{ scale: status === "success" ? [1, 1.1, 1] : 1 }}`
   - Text transitions: `<AnimatePresence mode="wait">` with fade in/out

5. **Colors:**

   - Use Bootstrap CSS variables: `var(--bs-primary)`, `var(--bs-success)`, `var(--bs-danger)`, `var(--bs-secondary)`

6. **Icons:**
   - Lucide React: `User`, `Lock`, `Edit`, `Save`, `X` (Cancel)
   - Size: 16px for labels, 28px for header icons

**Wireframe Description:**

```
┌─────────────────────────────────────────────┐
│  [User Icon]  Account Settings              │
├─────────────────────────────────────────────┤
│                                             │
│  Name                                       │
│  ┌─────────────────────────────────────┐  │
│  │ John Doe                     [Edit] │  │
│  └─────────────────────────────────────┘  │
│                                             │
│  Email                                      │
│  ┌─────────────────────────────────────┐  │
│  │ john@example.com (read-only)       │  │
│  └─────────────────────────────────────┘  │
│                                             │
│  ┌─────────────────────────────────────┐  │
│  │ ▼ Change Password                   │  │
│  │                                      │  │
│  │  Current Password                   │  │
│  │  ┌────────────────────────────────┐ │  │
│  │  │ ●●●●●●●●●●●●                   │ │  │
│  │  └────────────────────────────────┘ │  │
│  │                                      │  │
│  │  New Password                       │  │
│  │  ┌────────────────────────────────┐ │  │
│  │  │ ●●●●●●●●●●●●                   │ │  │
│  │  └────────────────────────────────┘ │  │
│  │                                      │  │
│  │  Confirm New Password               │  │
│  │  ┌────────────────────────────────┐ │  │
│  │  │ ●●●●●●●●●●●●                   │ │  │
│  │  └────────────────────────────────┘ │  │
│  └─────────────────────────────────────┘  │
│                                             │
│  ┌─────────────────────────────────────┐  │
│  │    Save Changes [✓]                 │  │ (animated button)
│  └─────────────────────────────────────┘  │
│                                             │
│  [Log Out]                                  │
└─────────────────────────────────────────────┘
```

---

## Test Plan

### Manual Testing Checklist

**Backend:**

1. ✅ Start backend (`./gradlew bootRun`), verify MySQL connection
2. ✅ Test `PUT /api/users/{id}` with Postman/curl:
   - Valid name update (200 OK, UserResponse without password)
   - Invalid user ID (404 Not Found)
   - Empty name (400 Bad Request)
3. ✅ Test `PUT /api/users/{id}/password`:
   - Valid password update (204 No Content)
   - Wrong current password (401 Unauthorized)
   - Weak new password (400 Bad Request)
   - Invalid user ID (404 Not Found)
4. ✅ Verify password hashing: Check MySQL database, confirm bcrypt hash format (`$2a$...`)
5. ✅ Test login after password change (ensure old password rejected, new password accepted)
6. ✅ Test signup: Confirm password is hashed in DB and not in response

**Frontend:**

1. ✅ Start frontend (`npm run dev`), navigate to `/account`
2. ✅ Verify page loads with current user data (name, email)
3. ✅ Click "Edit" on name field, change name, save:
   - Loading state shown (button animates, text changes)
   - Success state shown (green button, checkmark)
   - Name updates in UI and localStorage
4. ✅ Expand "Change Password", attempt to change with wrong current password:
   - Error state shown (red button, error message)
5. ✅ Change password with correct current password:
   - Success state shown
   - Log out, log back in with new password (success)
   - Attempt old password (rejected)
6. ✅ Test validation errors:
   - Empty name
   - Password < 8 chars
   - Password mismatch (new vs confirm)
7. ✅ Test network error handling (stop backend, attempt update)
8. ✅ Test responsive layout (mobile, tablet, desktop)

**Integration:**

1. ✅ End-to-end flow: Signup → Login → Update Name → Update Password → Logout → Login with new credentials
2. ✅ Cross-browser testing (Chrome, Firefox, Safari)
3. ✅ Verify no password leaks in Network tab (Inspect responses)

### Unit Tests (to add)

**Backend (UserControllerTest.java):**

- `testUpdateName_Success()`
- `testUpdateName_UserNotFound()`
- `testUpdateName_InvalidName()`
- `testUpdatePassword_Success()`
- `testUpdatePassword_WrongCurrentPassword()`
- `testUpdatePassword_WeakNewPassword()`
- `testUpdatePassword_UserNotFound()`
- `testPasswordHashingOnSignup()`
- `testLoginWithHashedPassword()`

**Frontend (Account.test.jsx):**

- Render test with mock user data
- Name update form submission
- Password update form submission
- Validation error display
- API error handling

---

## Open Questions to Confirm Before Implementation

1. **Password Strength Requirements:** What complexity rules do we want? (e.g., require uppercase, digit, special char?) Or just min length?
2. **Email Updates:** Should users be able to change their email? (Not in current scope, but may affect design)
3. **Confirmation Modal:** Should password changes require a confirmation dialog before submission?
4. **Session Invalidation:** After password change, should we log out the user and force re-login?
5. **Rate Limiting:** What limits for profile updates? (e.g., max 5 password changes per hour?)
6. **Error Message Detail:** Should we distinguish between "user not found" and "wrong current password" or return generic "update failed"?
7. **CORS Configuration:** Move hardcoded origin to application.properties with env variable?
8. **Auth Strategy:** Plan for JWT implementation timeline? (affects localStorage vs httpOnly cookies decision)
9. **Toast Library:** Add a dedicated toast notification library (react-hot-toast) or continue inline button feedback?
10. **Profile Picture:** Any future plans for avatar uploads? (may affect User entity structure)

---

## Appendix: Grep Map (Key Symbols and Locations)

### Frontend

| Symbol           | Location                              | Purpose                      |
| ---------------- | ------------------------------------- | ---------------------------- |
| `Account`        | `src/pages/Account.jsx`               | Main component               |
| `useAuth`        | `src/context/AuthContext.jsx:34`      | Hook to access auth context  |
| `AuthContext`    | `src/context/AuthContext.jsx:3`       | React Context for auth state |
| `signUp`         | `src/api/AuthAPI.jsx:11`              | API call for signup          |
| `signIn`         | `src/api/AuthAPI.jsx:16`              | API call for login           |
| `ProtectedRoute` | `src/components/ProtectedRoute.jsx:4` | Route protection HOC         |

### Backend

| Symbol             | Location                                                        | Purpose               |
| ------------------ | --------------------------------------------------------------- | --------------------- |
| `UserController`   | `src/main/java/team8/backend/controller/UserController.java:18` | REST controller       |
| `User`             | `src/main/java/team8/backend/entity/User.java:16`               | JPA entity            |
| `UserRepository`   | `src/main/java/team8/backend/repository/UserRepository.java:7`  | Data access layer     |
| `addUser` (signup) | `UserController.java:24`                                        | POST /signup endpoint |
| `loginUser`        | `UserController.java:35`                                        | POST /login endpoint  |
| `getAllUsers`      | `UserController.java:61`                                        | GET /all endpoint     |
| `existsByEmail`    | `UserRepository.java:14`                                        | Custom query method   |

### Configuration

| File                     | Purpose                                                                                   |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| `application.properties` | MySQL datasource config (env vars: `MYSQL_DATABASE_NAME`, `MYSQL_USER`, `MYSQL_PASSWORD`) |
| `package.json`           | Frontend dependencies (React 19, Bootstrap 5, Framer Motion, Axios)                       |
| `build.gradle`           | Backend dependencies (Spring Boot, JPA, MySQL, H2 for tests)                              |

### Diagrams/Links

- No existing architecture diagrams found in repo
- Frontend runs on: `http://localhost:5173` (Vite dev server)
- Backend runs on: `http://localhost:8080` (Spring Boot)
- Database: MySQL on `localhost:3306`

---

**End of Report**
