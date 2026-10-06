# Project Approach & Architecture — Build Secure 24

**Team ID:** 71  
**Project Name:** MarketHub  
**Team Size:** 4 Members  
**Primary Track / Domain:** E-Commerce / Secure Multi-Vendor Marketplace  

---

## 1. Problem Understanding, Scope & Threat Model

### 1.1 Problem Statement & Real-World Motivation
Multi-vendor marketplaces present unique cybersecurity challenges due to complex multi-tenant trust boundaries. Buyers, competing vendors, and marketplace administrators interact across a shared transactional space. Critical security vulnerabilities commonly arise around broken access controls (IDOR), unauthorized cross-vendor catalog modification, client-side pricing tampering, sensitive data leakage (PII, tokens, password hashes), and privilege escalation. MarketHub provides a secure, reliable marketplace where customers discover products, manage carts, checkout via simulated payments, and track order stages, while vendors manage isolated inventories and administrators audit operations.

### 1.2 Target Users & Personas
1. **Customer (End User):** Discovers products, manages personal cart, completes simulated checkouts, and tracks personal order history.
2. **Vendor (Merchant Partner):** Publishes and updates store inventory, reviews purchase orders containing own items, and manages fulfillment status transitions.
3. **Platform Administrator:** Audits system metrics, manages user activations, reviews vendor authorizations, and oversees marketplace integrity.

### 1.3 Threat Model & Attack Surface
- **Critical Assets:** User credentials, password hashes, JWT secrets, customer addresses/PII, inventory records, and financial transaction state.
- **Potential Attack Vectors:**
  - *IDOR & Cross-Tenant Tampering:* A vendor attempting to update or delete a rival's products; a buyer attempting to view or alter another customer's order.
  - *Client-Side Price Manipulation:* A malicious client altering cart item prices or grand totals during checkout.
  - *Privilege Escalation:* A user registering directly with the `ADMIN` role.
  - *Information Leakage:* API responses exposing password hashes or full error tracebacks.
  - *Clickjacking & MIME-Sniffing:* Framing of sensitive checkout pages.
- **OWASP Top 10 Considerations:**
  - *A01 Broken Access Control:* Enforced via backend dependency injection (`require_role`, customer/vendor ID verification).
  - *A02 Cryptographic Failures:* Passwords hashed using Bcrypt with 12 rounds work factor; signed JWT tokens using SHA-256 HMAC.
  - *A03 Injection:* SQLAlchemy parameterized queries prevent SQL injection completely.
  - *A04 Insecure Design:* Authoritative backend price and inventory recalculation prevents client-side price tampering.
  - *A05 Security Misconfiguration:* Mandatory HTTP security headers (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, CSP).

---

## 2. Technical Architecture & Secure System Design

### 2.1 High-Level Architecture Overview
MarketHub is structured as a modern decoupled multi-tier architecture:
- **Client Tier:** React (Vite) Single Page Application styled with custom design tokens, modern typography, responsive navbar, product grids, cart drawer, and interactive multi-stage order tracking component.
- **API Gateway & Domain Tier:** Python FastAPI asynchronous backend exposing RESTful endpoints with input validation via Pydantic V2 schemas.
- **Security & Authorization Layer:** Bcrypt password hashing, Bearer JWT authentication, and dependency-injected RBAC gates.
- **Persistence Tier:** SQLAlchemy ORM with SQLite database enforcing relational foreign keys and cascade rules.

### 2.2 Data Flow & Component Interaction
```
[React Frontend] 
     │ (HTTPS / Bearer JWT)
     ▼
[Security Middleware & CORS] ──▶ Adds X-Frame-Options, X-Content-Type-Options, CSP
     │
     ▼
[FastAPI Router & RBAC Gate] ──▶ Validates JWT, user role, and resource ownership
     │
     ▼
[Service Logic & Authoritative Price Calc] ──▶ Re-queries live stock & unit prices from DB
     │
     ▼
[SQLAlchemy ORM & Database] ──▶ Atomic transactions, stock decrement, order creation
```

### 2.3 Technology Stack Rationale
- **Backend Framework:** FastAPI chosen for high performance, automatic OpenAPI documentation, and strict schema validation via Pydantic.
- **Frontend / Client:** React (Vite) chosen for fast reactive updates, component isolation, and clean UI state management.
- **Database & Persistence:** SQLite with SQLAlchemy ORM chosen for zero-dependency portability and ACID transaction safety.
- **Authentication & Cryptography:** Bcrypt for salted one-way password hashing; PyJWT for stateless signed claims.

### 2.4 Defense-in-Depth Security Controls
1. **Authentication & Session Security:** Salted Bcrypt hashing, signed JWTs with expiration, zero password hash leakage.
2. **Authorization & Access Control:** Strict RBAC; customer order isolation; vendor-specific item segregation.
3. **Price & Stock Integrity:** Grand total and line items always recalculated on backend from active product records.
4. **Security Headers:** `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.
5. **Secrets Hygiene:** All secrets loaded from environment variables (`.env.example` provided).

---

## 3. Implementation Milestones & 24-Hour Timeline

| Milestone / Phase | Time Window | Key Objectives & Deliverables | Security Verification | Status |
|---|---|---|---|---|
| **Phase 1: Foundation & Setup** | 0h – 4h | Onboarding completion, repo setup, baseline schemas | Logging verification & rules agreement | `Completed` |
| **Phase 2: Core Domain & Auth** | 4h – 12h | Users, Vendors, Products, Cart, Orders, and Auth | Bcrypt crypto validation & RBAC tests | `Completed` |
| **Phase 3: Security & Hardening**| 12h – 18h | IDOR defense, authoritative pricing, security headers | Automated 25-test suite pass | `Completed` |
| **Phase 4: Polish & Deployment**| 18h – 24h | Responsive React UI, order tracking, deployment prep | Production build & health check | `Completed` |

---

## 4. Architecture Decision Records (ADRs)

### ADR-001: Backend Authoritative Price & Cart Calculation
- **Status:** Accepted
- **Context:** In untrusted client environments, attackers can modify payload prices during checkout.
- **Decision:** Checkout calculates line subtotals and order totals strictly from database product records, ignoring client-submitted numbers.
- **Trade-off:** Minimal extra query latency in exchange for complete financial integrity.

### ADR-002: Soft Deletion for Product Inventory
- **Status:** Accepted
- **Context:** Hard-deleting a product could break historical order receipts or referential integrity.
- **Decision:** Product deletions toggle `is_active = False` while preserving order history.

---

## 5. Engineering Journal & Real-Time Decision Log

### [2026-10-06 10:51 IST] Entry 1: Project Initialization & Scope Lock
- **Focus:** Onboarding agreement recorded, team metadata configured in `metadata/team.yaml`, Git repository initialized.

### [2026-10-06 11:15 IST] Entry 2: Backend Architecture & Test Suite Pass
- **Focus:** Built FastAPI backend with Bcrypt, JWT auth, RBAC, Cart, Orders, and Security Middleware. Ran 25 automated pytest tests with 100% pass rate.

### [2026-10-06 11:46 IST] Entry 3: Frontend Implementation & Production Bundle
- **Focus:** Developed React Vite frontend with design system, multi-role dashboards, visual order tracking timeline, and compiled production build.

---

## 6. Testing, Security Verification & Deployment Record

### 6.1 Testing & Security Verification Strategy
- **Automated Test Suite:** 25 pytest test cases verifying health endpoint, registration, duplicate rejection, login, customer/vendor/admin RBAC isolation, IDOR prevention, cart operations, checkout stock decrement, and HTTP security headers.
- **Test Result:** 25 passed, 0 failed.

### 6.2 Deployment Verification
- **Platforms Supported:** Render / Railway / Vercel / Docker.
- **Health Check Endpoint:** `GET /health` returns `{"status": "healthy", "service": "MarketHub API"}` with `X-Frame-Options: DENY`.

