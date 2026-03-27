# Multi-Tenant Shop SaaS (MERN)

This workspace contains:
- `backend`: Express + MongoDB API with OTP-by-email signup, owner login, forgot-password OTP reset, and shop profile management.
- `frontend`: React + Vite UI with split-page onboarding/login and Facebook-style profile page.

## Features implemented
- Create shop owner from left panel with `phone`, `gmail`, `password`.
- Email OTP verification flow after create.
- OTP expiry configured to `3 seconds` by default (`OTP_EXPIRES_SECONDS=3`).
- Owner saved in MongoDB collection `owner` only after OTP verify success.
- Owner fields include:
  - `phone`
  - `gmail` (unique)
  - `passwordHash`
  - `shopId` (unique random shop identifier)
  - `shopName`
  - `shopLogoPath`
  - `shopLocation`
- Right panel displays created shop list with round logos.
- Click shop to login as owner (gmail/phone + password).
- Forgot password with OTP verification.
- Post-login profile page with:
  - top cover section
  - center circular logo
  - logo upload
  - editable shop name and location
  - shop details display

## Security controls
- Password hashing with `bcryptjs`.
- JWT authentication for protected profile APIs.
- `helmet` security headers.
- CORS allowlist via `FRONTEND_URL`.
- Global API rate limiter.
- Mongo operator sanitization via `express-mongo-sanitize`.
- OTP hashed before storage.
- OTP attempt limits.
- File upload MIME/size restrictions for logos.

## Backend setup
1. Go to backend:
   - `cd backend`
2. Copy env file:
   - `cp .env.example .env`
3. Update `.env` values (MongoDB + SMTP required).
4. Install and run:
   - `npm install`
   - `npm run dev`

Backend runs on `http://localhost:5000` by default.

## Frontend setup
1. Go to frontend:
   - `cd frontend`
2. Install and run:
   - `npm install`
   - `npm run dev`

Frontend runs on `http://localhost:5173` and proxies `/api` + `/uploads` to backend.

## Main API routes
- `POST /api/auth/signup/request-otp`
- `POST /api/auth/signup/verify-otp`
- `POST /api/auth/login`
- `POST /api/auth/password/request-otp`
- `POST /api/auth/password/verify-otp`
- `GET /api/shops`
- `GET /api/shops/me` (auth)
- `PATCH /api/shops/me` (auth, multipart logo upload)

## Notes
- OTP expiry of 3 seconds is strict and can cause frequent expirations in real usage.
- For production, consider increasing `OTP_EXPIRES_SECONDS` (for example, `120`).
