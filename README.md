# Medash HR Suite

A new HR management and payroll application. This repository is a staging foundation and is not yet production-ready.

## Deployment notes
- Keep the legacy Roost website and database unchanged while staging.
- Configure a separate PostgreSQL database for testing.
- Store database credentials and signing/encryption values only in server-side deployment settings.
- Test signup, login, tenant isolation, persistence, and API routes before launch.
- Selar checkout: https://selar.com/5w877x1957. Purchase verification and licence activation remain manual until an official supported integration is confirmed.
- The app now includes an owner/HR-admin **Country & Region** screen for Nigeria, United Kingdom, and United States, saving country, currency preference, locale, and time zone.
- Important: the currency preference is not yet applied to every amount shown. Nigerian payroll logic remains in the app; UK and US payroll calculations are not implemented. Do not use this build for UK/US payroll or treat it as production-ready.
- Nigeria, UK and US support requires separate payroll rules and testing; currency display alone is not payroll compliance.

## Local development
Run `npm install`, then `npm run dev`. Use `npm run build` to compile the API and Next.js application.