# Medash HR Suite

A new HR management and payroll application. This repository is a staging foundation and is not yet production-ready.

## Deployment notes
- Keep the legacy Roost website and database unchanged while staging.
- Configure a separate PostgreSQL database for testing.
- Store database credentials and signing/encryption values only in server-side deployment settings.
- Test signup, login, tenant isolation, persistence, and API routes before launch.
- Selar checkout: https://selar.com/5w877x1957. Purchase verification and licence activation remain manual until an official supported integration is confirmed.
- The app now includes an owner/HR-admin **Country & Region** screen for Nigeria, United Kingdom, and United States, saving country, currency preference, locale, and time zone.
- Important: currency/date formatting uses shared regional helpers, but every screen still needs review. Nigerian payroll logic is legacy and must be professionally checked against current 2026 rules. UK and US payroll calculations are not implemented and the backend blocks payroll runs for those countries.
- Nigeria, UK and US support requires separate payroll rules and testing; currency display alone is not payroll compliance.

- Prospect-facing landing page: `/for-businesses` (demo requests currently go through WhatsApp; no automated lead CRM or subscription checkout is wired up).
- International client outreach and product-readiness checklist: `docs/INTERNATIONAL-GO-TO-MARKET.md`.
- New cloud company signups receive a 14-day trial. Protected API routes enforce trial/subscription expiry; the company status endpoint remains available so the app can show the expiry screen.
- Cloud company country/currency/locale/timezone are saved to the company record. The `/admin` page provides a secret-protected company list and manual subscription activation; set `ADMIN_ACTIVATION_SECRET` to a strong random value of at least 32 characters in Vercel before using it.
- Required production environment variables: `DATABASE_URL`, `JWT_SECRET` (at least 32 characters), `ENCRYPTION_KEY` (exactly 64 hexadecimal characters), and `ADMIN_ACTIVATION_SECRET` (at least 32 characters). Keep them in Vercel server-side environment settings; never commit them.
- The cloud API currently persists employees and payroll in PostgreSQL. Several other HR modules still use browser-local state, so do not onboard real customers or rely on cloud backup for leave, attendance, training, documents, reviews, hiring, and reports until cloud persistence is completed and tested.
- CI workflow added at `.github/workflows/ci.yml` to build backend and frontend on pushes and pull requests.

## Local development
Run `npm install`, then `npm run dev`. Use `npm run build` to compile the API and Next.js application.