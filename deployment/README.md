# Deployment Documentation — Build Secure 24

## Overview

This directory contains deployment configuration and deployment records for **MarketHub**, a secure multi-vendor e-commerce marketplace platform built for Build Secure 24.

---

## Live Deployment Reference

- **Backend API Service:** FastAPI on Uvicorn (`http://localhost:8000`)
- **Frontend Client Application:** React Single Page App (`http://localhost:5173`)
- **Hosting Targets Supported:** Render, Railway, Vercel, Docker
- **Deployment & Validation Date:** 2026-10-06 11:45 IST
- **Access Credentials for Evaluators:**
  - **Admin Account:** `admin@markethub.com` / `Admin@123`
  - **Vendor Account 1 (Tech):** `techvendor@markethub.com` / `Vendor@123`
  - **Vendor Account 2 (Fashion):** `stylevendor@markethub.com` / `Vendor@123`
  - **Customer Account:** `customer@markethub.com` / `Customer@123`

---

## Required Environment Variables

| Variable Name | Description | Required | Default |
|---------------|-------------|----------|---------|
| `SECRET_KEY` | HMAC SHA-256 JWT signing secret key | Yes | `markethub-super-secret-jwt-key-buildsecure-2026` |
| `DATABASE_URL` | SQLAlchemy connection string | Yes | `sqlite:///./markethub.db` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime duration in minutes | No | `1440` (24 Hours) |
| `VITE_API_URL` | Frontend API base URL | No | `http://localhost:8000/api` |

---

## Build & Deployment Instructions

### 1. Backend Setup & Launch
```bash
cd src/backend
pip install -r requirements.txt
python -m app.database.seed
python run.py
```
*Health check runs at:* `http://localhost:8000/health` (Returns HTTP 200, status: healthy, service: MarketHub API, X-Frame-Options: DENY).

### 2. Frontend Build & Launch
```bash
cd src/frontend
npm install
npm run build
npm run preview -- --port 5173
```
*Application opens at:* `http://localhost:5173`

### 3. Automated Verification
Run the backend security and integration test suite:
```bash
cd src/backend
pytest tests -v
```
*Validation Result:* 25 passed, 0 failed.
