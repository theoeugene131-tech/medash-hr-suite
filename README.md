# Medash HR Suite

A new HR management and payroll application. This repository is a staging foundation and is not yet production-ready.

## Deployment notes
- Keep the legacy Roost website and database unchanged while staging.
- Configure a separate PostgreSQL database for testing.
- Store database credentials and signing/encryption values only in server-side deployment settings.
- Test signup, login, tenant isolation, persistence, and API routes before launch.
- Selar checkout: https://selar.com/5w877x1957. Purchase verification and licence activation remain manual until an official supported integration is confirmed.
- Nigeria, UK and US support requires separate payroll rules and testing; currency display alone is not payroll compliance.

## Local development
Run `npm install`, then `npm run dev`. Use `npm run build` to compile the API and Next.js application.