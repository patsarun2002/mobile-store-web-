# 📱 Mobile Store Web

![Live Demo](https://img.shields.io/badge/demo-live-green)

A full-stack web application for managing a mobile phone shop with stock buying, sales processing, repair/service jobs, and company settings. Built with **Next.js 16** (App Router) and **Node.js + Express** backend, using **MongoDB** via **Prisma ORM**.

---

## 🛠️ Tech Stack

| Layer      | Technology                                                                                                                                                       |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework  | Next.js ^16.2.6 (App Router)                                                                                                                                     |
| Frontend   | React ^19.2.6, TypeScript, Tailwind CSS ^4.3.0                                                                                                                   |
| Backend    | Node.js, Express ^5.2.1, TypeScript ^6.0.3, tsx ^4.22.3                                                                                                          |
| Runtime    | tsx ^4.22.3 (TypeScript execution)                                                                                                                               |
| Database   | MongoDB (via Prisma ^6.19.3 ORM)                                                                                                                                 |
| Auth       | JWT (jsonwebtoken ^9.0.3), bcrypt ^6.0.0                                                                                                                         |
| Storage    | None                                                                                                                                                             |
| Validation | Zod ^4.4.3                                                                                                                                                       |
| Caching    | None                                                                                                                                                             |
| UI Extras  | Lucide React ^1.17.0, Recharts ^2.15.4, SweetAlert2 ^11.26.25, Day.js ^1.11.21, Axios ^1.16.1, js-cookie ^3.0.8                                                  |
| Tools      | dotenv ^17.4.2, body-parser ^2.2.2, cookie-parser ^1.4.7, cors ^2.8.6, helmet ^8.2.0, express-rate-limit ^8.5.2, express-mongo-sanitize ^2.2.0, xss-clean ^0.1.4 |

---

## ✨ Features Overview

- **Authentication System** — JWT-based authentication with 1-hour token expiration, bcrypt password hashing (12 salt rounds), cookie-based session storage via `js-cookie`, Next.js middleware for route protection on `/backoffice/*` routes
- **Dashboard** — Summary statistics (total income from paid sales, pending income, total paid sales count, pending sales count, total repair jobs count, total cost, total profit, profit margin) displayed with Recharts bar chart showing monthly revenue and today's sales
- **Stock Management (Buy)** — Add products with serial number, name, release, color, price, cost price, customer info (name, phone, address), and remark; supports bulk entry via quantity field (max 10,000 units per request with batch processing); full CRUD operations with modal form; soft-delete sets status to `delete`; search/filter by serial, name, customer name, phone, color, release
- **Sales Processing (Sell)** — Sell phones by serial number lookup (must be `instock`); builds pending sell list with running total; confirm all pending sales at once which updates sell status to `paid` and product status to `sold`; transaction-based operations with customer info transfer
- **Service/Repair Jobs** — Log repair/service jobs with name, price, remark (optional), and auto-set `payDate`; full CRUD operations with modal form; jobs ordered by `payDate` descending
- **Company Settings** — Set shop information (name, address, phone, email, tax code); uses upsert pattern (create on first save, update existing record thereafter); single-record pattern
- **User Management** — Manage staff accounts with name, username, password, and role level (`admin`, `manager`, `staff`, `user`); soft-delete sets status to `inactive`; users filtered by `active` status in list; admin-only access for user CRUD; users can update own profile
- **Role-Based Access** — Four user levels: `admin` (full access), `manager`, `staff`, `user` (standard staff access); level stored in User model; authorization middleware protects routes with backward compatibility for legacy tokens
- **Input Validation** — Zod schemas validate all API requests (user signin/create/update, company, product, sell, service); password strength requirements (min 8 chars, uppercase, lowercase, number)
- **Security Measures** — Helmet security headers (HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy), rate limiting (auth: 5/15min production, 100/15min development; API: 100/15min production, 500/15min development), CORS with allowed origins, NoSQL injection protection (express-mongo-sanitize), XSS protection (xss-clean), HTTPS enforcement in production, request logging, JWT secret key validation (min 32 chars)
- **Responsive UI** — Tailwind CSS-styled interface with collapsible sidebar navigation, modal forms, mobile hamburger menu, and gradient teal theme
- **Error Handling** — Centralized error handling middleware with AppError class, Prisma error handling, Zod error handling, development vs production error responses
- **Analytics** — Revenue by month chart, today's sales stats, dashboard with profit calculations and cost tracking

---

## 📁 Project Structure

```
mobile_store/
├── api/                                    # Backend (Node.js + Express)
│   ├── src/
│   │   ├── api/                            # API route definitions
│   │   │   ├── v1/                         # API v1 routes
│   │   │   │   ├── analyticsRoutes.ts      # Analytics endpoints (dashboard, revenue, today sales)
│   │   │   │   ├── companyRoutes.ts        # Company endpoints
│   │   │   │   ├── productRoutes.ts        # Product endpoints with low-stock count
│   │   │   │   ├── sellRoutes.ts           # Sell endpoints
│   │   │   │   ├── serviceRoutes.ts        # Service endpoints
│   │   │   │   └── userRoutes.ts           # User/auth endpoints with rate limiting
│   │   │   └── index.ts                    # API router entry point
│   │   ├── controllers/                    # API route handlers
│   │   │   ├── CompanyController.ts         # Company settings (upsert pattern)
│   │   │   ├── ProductController.ts         # Product/stock management (bulk create with batching, soft-delete)
│   │   │   ├── SellController.ts            # Sales processing, confirmation, dashboard stats, analytics
│   │   │   ├── ServiceController.ts         # Service/repair jobs CRUD
│   │   │   └── UserController.ts            # Authentication (signin, info), user CRUD with RBAC
│   │   ├── services/                       # Business logic layer
│   │   │   ├── CompanyService.ts           # Company operations with upsert
│   │   │   ├── ProductService.ts           # Product operations with batch creation (500 per batch)
│   │   │   ├── SellService.ts              # Sales operations with transactions, analytics
│   │   │   ├── ServiceService.ts           # Service operations
│   │   │   └── UserService.ts              # User operations with bcrypt hashing, RBAC
│   │   ├── middleware/                     # Custom middleware
│   │   │   ├── auth.ts                    # JWT authentication & authorization (RBAC with backward compatibility)
│   │   │   └── validation.ts              # Zod validation schemas & middleware
│   │   ├── utils/                          # Utility libraries
│   │   │   ├── controllerHelpers.ts       # Helper functions for controllers
│   │   │   ├── errorHandler.ts            # Centralized error handling with AppError
│   │   │   └── prisma.ts                  # Prisma client singleton
│   │   ├── types/                          # TypeScript type definitions
│   │   │   ├── express/                    # Express-related types
│   │   │   ├── shared/                     # Shared types
│   │   │   └── index.ts
│   │   └── index.ts                        # Express server setup, security middleware, route definitions
│   ├── prisma/
│   │   └── schema.prisma                   # Database schema definition (MongoDB)
│   ├── scripts/
│   │   └── seed-data.ts                    # Database seeding script with default users
│   ├── package.json                        # Backend dependencies
│   ├── tsconfig.json                       # TypeScript configuration
│   ├── eslint.config.js                   # ESLint configuration
│   └── .env.example                        # Environment variables template
│
└── my-app/                                 # Frontend (Next.js 16)
    ├── app/
    │   ├── (auth)/                         # Authentication route group
    │   │   └── signin/                     # Sign-in page
    │   │       └── page.tsx                # Cookie-based sign-in form
    │   ├── (dashboard)/                    # Dashboard route group
    │   │   └── backoffice/                 # Protected admin panel routes
    │   │       ├── _components/            # Backoffice shared components
    │   │       │   ├── Modal.tsx           # Reusable modal component
    │   │       │   └── Sidebar.tsx         # Navigation sidebar with user profile
    │   │       ├── layout.tsx              # Backoffice layout wrapper
    │   │       ├── dashboard/              # Dashboard with stats & chart
    │   │       │   └── page.tsx
    │   │       ├── buy/                    # Stock management page
    │   │       │   └── page.tsx
    │   │       ├── sell/                   # Sales processing page
    │   │       │   └── page.tsx
    │   │       ├── repair/                 # Service/repair jobs page
    │   │       │   └── page.tsx
    │   │       ├── company/                # Company settings page
    │   │       │   └── page.tsx
    │   │       └── user/                   # User management page
    │   │           └── page.tsx
    │   ├── _components/                    # Global shared components
    │   ├── _lib/                           # Frontend utilities
    │   │   ├── config/                     # Configuration files
    │   │   │   └── app.config.ts           # API configuration (apiUrl)
    │   │   ├── constants/                  # Application constants
    │   │   └── utils/                      # Utility functions
    │   ├── _services/                      # Service layer
    │   │   └── api/                        # API client
    │   │       ├── client.ts               # Axios instance with request/response interceptors
    │   │       └── index.ts
    │   ├── _types/                         # TypeScript type definitions
    │   │   ├── api/                        # API-related types
    │   │   └── models/                     # Data model types
    │   ├── layout.tsx                       # Root layout with fonts
    │   ├── page.tsx                         # Landing page (sign-in)
    │   ├── globals.css                      # Global Tailwind styles
    │   └── favicon.ico
    ├── server/                              # Server-side code
    │   └── proxy.ts                         # Proxy configuration
    ├── public/                              # Static assets
    │   ├── fonts/                           # Custom fonts
    │   ├── icons/                           # Icon files
    │   └── images/                          # Image files
    ├── package.json                         # Frontend dependencies
    ├── tsconfig.json                        # TypeScript configuration
    ├── tailwind.config.ts                   # Tailwind CSS configuration
    ├── next.config.js                       # Next.js configuration
    ├── postcss.config.mjs                   # PostCSS configuration
    ├── eslint.config.js                     # ESLint configuration
    ├── vercel.json                          # Vercel deployment configuration
    └── next-env.d.ts                        # Next.js type definitions
```

---

## 🗃️ Database Schema

| Model          | Description                                                                                                                                                                                                                                                                                                                                  |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `User`         | Staff accounts with authentication credentials; fields: id, name, username (unique), password (bcrypt hashed), level (enum: admin, user, staff, manager, default: user), status (enum: active, inactive, default: active), tokenVersion, failedLoginAttempts, lockedUntil, relation to RefreshToken, createdAt, updatedAt                    |
| `Company`      | Single-record shop information; fields: id, name, address, phone, email (optional), taxCode, createdAt, updatedAt                                                                                                                                                                                                                            |
| `Product`      | Mobile phone inventory; fields: id, serial (unique), name, release, color, price, costPrice (default: 0), customerName, customerPhone, customerAddress, remark, status (enum: instock, reserved, sold, delete, default: instock), relation to Sell, createdAt, updatedAt; indexes on status, color, release, customerPhone, customerName     |
| `Sell`         | Sales transactions linked to products; fields: id, productId (relation to Product), status (enum: pending, paid, default: pending), price, paymentMethod (enum: cash, transfer, credit_card, installment, default: cash), customerName, customerPhone, customerAddress, payDate, createdAt, updatedAt; indexes on status, productId, payDate |
| `Service`      | Repair/service job records; fields: id, name, price, remark (optional), payDate, createdAt, updatedAt; index on payDate                                                                                                                                                                                                                      |
| `RefreshToken` | JWT refresh tokens for session management; fields: id, token, userId (relation to User), expiresAt, createdAt, updatedAt; indexes on token, userId                                                                                                                                                                                           |

---

## 🔄 System Flow

## 01 · Authentication

```
Sign In → POST /api/auth/signin → Validate Credentials → Hash Check → JWT Token (1h) → Cookie Storage → Middleware Check → Access Granted
```

- Users sign in with username and password
- Server validates credentials against User model with `status: "active"`
- Password compared using bcrypt (12 salt rounds)
- Server returns JWT token with 1-hour expiration signed with `SECRET_KEY` (min 32 chars)
- Token stored in browser cookie via `js-cookie`
- Next.js middleware checks for token cookie on `/backoffice/*` routes
- Missing token redirects to `/signin`
- Axios interceptor adds `Authorization: Bearer <token>` header to API requests
- Response interceptor handles 401 errors by removing token and redirecting to signin
- Protected API endpoints decode JWT from `Authorization` header via `authenticateToken` middleware
- Authorization middleware supports backward compatibility for tokens without level (fetches from database)
- Rate limiting on signin: 5 attempts per 15 minutes (production), 100 attempts (development)

| User Level | Access                              |
| ---------- | ----------------------------------- |
| `admin`    | Full access to all backoffice pages |
| `manager`  | Manager-level access                |
| `staff`    | Staff-level access                  |
| `user`     | Standard staff access to backoffice |

## 02 · Stock Management Flow

```
Add Stock → POST /api/products → Validate (Zod) → Bulk Create (max 10,000, batch 500) → Product Created (instock) → List Products (filters) → Update/Delete → Low Stock Count
```

- Admin adds products with serial, name, release, color, price, cost price, customer info, remark
- Zod validation: serial (max 50), name (max 100), price (max 1,000,000), phone regex, qty (max 100)
- Bulk quantity supported via `qty` field (max 10,000 units per request, processed in batches of 500)
- Serial numbers auto-generated with suffix: `{serial}-{0001}`, `{serial}-{0002}`, etc.
- Products default to `instock` status
- List endpoint filters out products with `status: "delete"` (soft-delete)
- Search filters: serial, name, customerName, customerPhone (contains)
- Additional filters: status, color, release
- Update endpoint modifies all product fields including costPrice
- Remove endpoint soft-deletes by setting status to `delete` (checks for pending sells first)
- Low stock count endpoint returns total instock count with low stock threshold
- Authorization: admin only for create/update/delete

| Product Status | Description                        |
| -------------- | ---------------------------------- |
| `instock`      | Available for sale                 |
| `reserved`     | Reserved for pending sale          |
| `sold`         | Sold (after sales confirmation)    |
| `delete`       | Soft-deleted, hidden from buy list |

## 03 · Sales Flow

```
Enter Serial → Lookup Product (instock) → POST /api/sells → Add to Pending List → Review Total → PUT /api/sells/confirm → Transaction → Status: paid/sold
```

- Admin enters serial number, selling price, payment method, and customer info
- System looks up product by serial where status is `instock`
- Zod validation: serial (min 1), price (positive)
- Product status immediately updated to `reserved` to prevent race conditions
- Product added to pending sell list (status: `pending`) via transaction
- List endpoint returns pending sells with product serial and name
- Admin reviews list with running total
- Remove endpoint deletes individual pending sell and reverts product status to `instock`
- Confirmation endpoint uses transaction to update all pending sells to `paid` and related products to `sold` with customer info transfer and payDate
- Dashboard stats: total income, pending income, total repair count, total paid sales count, pending sales count, total cost, total profit, profit margin
- Revenue by month endpoint returns monthly revenue data for chart (Thai month names)
- Today's sales endpoint returns today's income and count
- Authorization: admin only for create/confirm/delete

| Sell Status | Description                               |
| ----------- | ----------------------------------------- |
| `pending`   | Added to sell list, awaiting confirmation |
| `paid`      | Sale confirmed, payment recorded          |

| Payment Method | Description      |
| -------------- | ---------------- |
| `cash`         | Cash payment     |
| `transfer`     | Bank transfer    |
| `credit_card`  | Credit card      |
| `installment`  | Installment plan |

## 04 · Service/Repair Flow

```
Log Job → POST /api/services → Validate (Zod) → Service Record → List Jobs → Update/Delete
```

- Admin logs repair/service jobs with name, price, remark (optional)
- Zod validation: name (max 100), price (positive), remark (max 500)
- `payDate` auto-set to current date on create
- List endpoint orders jobs by `payDate` descending
- Update endpoint modifies name, price, remark
- Remove endpoint hard-deletes service record
- Authorization: admin only for create/update/delete

## 05 · Company Settings Flow

```
Save Settings → POST /api/company → Validate (Zod) → Upsert (create or update) → Single Record → GET /api/company
```

- First save checks for existing company record via `findFirst()`
- Zod validation: name (max 100), address (max 200), phone regex, email (optional), taxCode (max 50)
- If no record exists, creates new company entry
- If record exists, updates existing record
- Single-record pattern (only one company entry in database)
- List endpoint returns single company record or null
- Authorization: admin only

## 06 · User Management Flow

```
Create User → POST /api/users → Validate (Zod) → Hash Password → Create User → GET /api/users (active only) → PUT /api/users/:id → DELETE /api/users/:id
```

- Admin creates users with name, username, password, level
- Zod validation: name (max 100), username (3-50 chars, alphanumeric + underscore), password (min 8, uppercase + lowercase + number required), level (admin/user)
- Password hashed with bcrypt (12 salt rounds)
- List endpoint filters users by `status: "active"`
- Update endpoint allows name, username, password, level changes
- Password update requires same strength validation
- Users can update own profile (name, password) but not level
- Admins can update any user including level
- Remove endpoint soft-deletes by setting status to `inactive`
- Users can delete themselves; admins can delete any user
- Authorization: admin only for list/create/updateId/removeId

| User Status | Description                    |
| ----------- | ------------------------------ |
| `active`    | Active user account            |
| `inactive`  | Soft-deleted, hidden from list |

---

## 💾 Caching Strategy

No caching strategy implemented in this codebase.

---

## 🔐 Security

- JWT authentication with 1-hour token expiration
- bcrypt password hashing with 12 salt rounds
- Cookie-based session storage using `js-cookie`
- Next.js middleware protects `/backoffice/*` routes by checking token cookie
- Axios request interceptor adds `Authorization: Bearer <token>` header
- Axios response interceptor handles 401 errors (token expiration)
- Role-based access control (RBAC) via `authorize` middleware (admin, manager, staff, user)
- Authorization middleware supports backward compatibility for legacy tokens without level field
- Zod input validation on all API endpoints with detailed error messages
- Password strength requirements: minimum 8 characters, at least one uppercase, one lowercase, and one number
- Helmet security headers: HSTS (1 year, includeSubDomains, preload), X-Content-Type-Options, X-Frame-Options (deny), Referrer-Policy (strict-origin-when-cross-origin)
- Rate limiting: auth endpoints (5 requests/15 minutes production, 100/15 minutes development), API endpoints (100 requests/15 minutes production, 500/15 minutes development)
- CORS with allowed origins (localhost:3000, localhost:3001, FRONTEND_URL env var), credentials support, maxAge 86400
- Production mode enforces strict CORS (only FRONTEND_URL allowed)
- NoSQL injection protection via express-mongo-sanitize
- XSS protection via xss-clean
- HTTPS enforcement in production (redirects HTTP to HTTPS via x-forwarded-proto)
- Request logging middleware (timestamp, method, URL, IP)
- Environment variable validation (DATABASE_URL, SECRET_KEY required; SECRET_KEY min 32 chars)
- Soft-delete pattern for users (status: `inactive`) and products (status: `delete`)
- Centralized error handling with AppError class, Prisma error handling, Zod error handling
- Development vs production error responses (detailed in dev, generic in prod)
- Request body size limit: 10kb
- Transaction-based operations for sales (product status updates atomic with sell status)
- Product deletion prevents deletion if pending sells exist
- Seed script creates default users with known passwords for initial setup

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB (local or Atlas)

### Installation

```bash
# Install backend dependencies
cd api
npm install

# Install frontend dependencies
cd ../my-app
npm install
```

### Environment Variables

Create `.env` in `api/`:

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/mobile-store?retryWrites=true&w=majority&connectTimeoutMS=30000&socketTimeoutMS=45000&serverSelectionTimeoutMS=30000&maxPoolSize=20&minPoolSize=5
SECRET_KEY=your-secret-key-min-32-characters-long
FRONTEND_URL=http://localhost:3000
```

### Database Setup

```bash
cd api
npx prisma generate
npx prisma db push

# Optional: Seed database with sample data
npm run seed
```

Seed creates default users:

- admin / admin123
- manager / manager123
- user / user123
- staff1 / staff123
- staff2 / staff123

### Run Development

```bash
# Start backend (port 3001)
cd api
npm run dev

# Start frontend (port 3000, with Turbopack)
cd my-app
npm run dev
```

### Build for Production

```bash
# Build backend
cd api
npm run build
npm start

# Build frontend
cd my-app
npm run build
npm start
```

---

## 👤 Author

**Patsarun Kathinthong**

- Full Stack Developer (Next.js, Node.js, MongoDB)
- Email: patsarun2545@gmail.com
- GitHub: [github.com/patsarun2545](https://github.com/patsarun2545)
