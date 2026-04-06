# Finance Dashboard — Backend

A production-structured Node.js + Express + MongoDB backend for a role-based finance dashboard. The codebase prioritises **separation of concerns**, **reusable utilities**, and **clear access control** over feature volume.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express.js 4 |
| Database | MongoDB via Mongoose 8 |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Validation | Joi |
| Security | helmet, cors, express-rate-limit |

---

## Project Structure

```
src/
├── app.js              # Express app (no listen — importable for tests)
├── server.js           # Entry point — connects DB, starts server
├── config/
│   ├── constants.js    # ROLES, TRANSACTION_TYPES, CATEGORIES enums
│   ├── db.js           # Mongoose connection
│   └── seed.js         # Dev seed script
├── controllers/        # Thin HTTP layer — calls service, sends response
│   ├── authController.js
│   ├── userController.js
│   ├── transactionController.js
│   └── dashboardController.js
├── middleware/
│   ├── authenticate.js # Verifies JWT, attaches req.user
│   ├── authorize.js    # authorize(...roles) factory middleware
│   └── errorHandler.js # Global error + 404 handler
├── models/
│   ├── User.js
│   └── Transaction.js
├── routes/
│   ├── index.js        # Central router
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── transactionRoutes.js
│   └── dashboardRoutes.js
├── services/           # All business logic lives here
│   ├── authService.js
│   ├── userService.js
│   ├── transactionService.js
│   └── dashboardService.js
├── utils/
│   ├── jwt.js          # signToken / verifyToken
│   ├── pagination.js   # Pagination helpers
│   └── response.js     # Consistent JSON response helpers
└── validators/
    ├── userValidator.js
    └── transactionValidator.js


```

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

### 3. Seed the database (optional)
```bash
npm run seed
```
This creates three users:

| Role | Email | Password |
|---|---|---|
| admin | admin@example.com | password123 |
| analyst | analyst@example.com | password123 |
| viewer | viewer@example.com | password123 |

### 4. Start the server
```bash
npm run dev   # development (nodemon)
npm start     # production
```


---

## API Reference

Base URL: `http://localhost:3000/api/v1`

All protected routes require:
```
Authorization: Bearer <token>
```

---

### Auth

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register new user |
| POST | `/auth/login` | Public | Login, receive JWT |
| GET | `/auth/me` | All authenticated | Get current user |

**Register / Login body:**
```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "password123",
  "role": "viewer"     // optional, defaults to viewer
}
```

---

### Users

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/users` | Admin | List all users |
| GET | `/users/:id` | Admin | Get user by ID |
| PATCH | `/users/:id` | Admin (any) / Self (own) | Update user |
| DELETE | `/users/:id` | Admin | Delete user |

**PATCH body (any subset):**
```json
{
  "name": "New Name",
  "role": "analyst",
  "status": "inactive"
}
```
> Non-admin users can patch only their own `name`. `role` and `status` fields are ignored for non-admins.

---

### Transactions

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/transactions` | All roles | List with filters + pagination |
| GET | `/transactions/:id` | All roles | Get single transaction |
| POST | `/transactions` | Admin | Create transaction |
| PATCH | `/transactions/:id` | Admin | Update transaction |
| DELETE | `/transactions/:id` | Admin | Soft-delete transaction |

**POST / PATCH body:**
```json
{
  "amount": 2500.00,
  "type": "income",
  "category": "salary",
  "date": "2024-03-15",
  "description": "March salary"
}
```

**GET query parameters:**
| Param | Type | Example |
|---|---|---|
| `type` | string | `income` \| `expense` |
| `category` | string | `rent` |
| `startDate` | ISO date | `2024-01-01` |
| `endDate` | ISO date | `2024-03-31` |
| `page` | number | `1` |
| `limit` | number | `20` |
| `sortBy` | string | `date` \| `amount` |
| `order` | string | `asc` \| `desc` |

---

### Dashboard

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/dashboard/summary` | Admin, Analyst | Income / expenses / net balance |
| GET | `/dashboard/categories` | Admin, Analyst | Totals by category |
| GET | `/dashboard/trends` | Admin, Analyst | Monthly or weekly trends |
| GET | `/dashboard/recent-activity` | Admin, Analyst | Latest N transactions |

**Summary query params:** `?period=week|month|year` (default: all time)

**Trends query params:** `?groupBy=month|week&year=2024`

**Sample summary response:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "totalIncome": 15000,
    "totalExpenses": 6200,
    "netBalance": 8800,
    "incomeCount": 12,
    "expenseCount": 18,
    "period": "month"
  }
}
```

---

## Role Permission Matrix

| Action | Viewer | Analyst | Admin |
|---|:---:|:---:|:---:|
| View transactions | ✅ | ✅ | ✅ |
| Create / Update / Delete transactions | ❌ | ❌ | ✅ |
| View dashboard summary | ❌ | ✅ | ✅ |
| Category breakdown | ❌ | ✅ | ✅ |
| Trends & recent activity | ❌ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| Update own profile | ✅ | ✅ | ✅ |

---

## Key Design Decisions

### 1. Service layer separation
Controllers handle HTTP only (parse request, call service, send response). All business logic, DB queries, and error throwing live in services. This makes services independently testable and reusable.

### 2. Soft delete on transactions
Transactions are never truly removed. `isDeleted: true` is set instead, and a Mongoose pre-find hook silently filters them out. This preserves audit trails and allows future restore functionality.

### 3. authorize() factory middleware
Role checks are applied at the route level using a single composable factory:
```js
router.post("/", authorize("admin"), handler)
```
This keeps routing declarative and business rules readable at a glance.

### 4. Consistent response shape
All responses use helpers from `utils/response.js` — every success and error looks the same, making frontend integration predictable.

### 5. app.js vs server.js split
The Express `app` is exported from `app.js` without `.listen()`. `server.js` connects the DB and calls listen. This pattern lets tests import `app` directly without spinning up a real server port.

### 6. Validation with Joi
Joi schemas are defined once per domain and wrapped by a `validate(schema)` factory into Express middleware. Query param validation is handled separately from body validation.

---

## Assumptions

- A "viewer" can read transaction records but has no access to analytics — dashboards are analyst+ only. This models a typical pattern where raw data read-access and insight access are separate concerns.
- Only admins can create transactions (i.e. only trusted staff enter financial records).
- Soft delete applies to transactions only; users are hard-deleted since they have no financial ledger implications in this scope.
- Passwords are hashed with bcrypt (12 rounds). The plain text password field is excluded from all query results via `select: false`.
- Rate limiting is set to 100 requests per 15 minutes per IP — suitable for a dashboard scenario.
