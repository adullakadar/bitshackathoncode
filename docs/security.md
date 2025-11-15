# Security

## Trust Boundaries
- Browser ↔ Express: public network boundary; validate inputs and enforce content types.
- Express ↔ OpenRouter: external API; protect API key via environment variables.
- Express ↔ SMTP: optional external service; credentials via `.env`.

## Controls Implemented
- Upload filtering: Multer `.txt`-only; server double-checks MIME and limits size.
- No persistence of uploads: memory storage only.
- Size caps: total text and per-file truncation.
- Error handling: structured JSON errors; try/catch around external calls.

## Threat Model (STRIDE summary)
- Spoofing: Use CORS defaults (same-origin) for UI; consider adding CSRF token if adding stateful actions.
- Tampering: Validate request body types and lengths; ignore unknown fields.
- Repudiation: Add request logging in production environments.
- Information Disclosure: Do not echo secrets; never log API keys; redact PII in logs if added.
- Denial of Service: File size limits and truncation reduce LLM payload size; consider adding rate limiting.
- Elevation of Privilege: No auth now; if multi-user added, implement authz and least privilege.

## Recommended Hardening
- Add `helmet` middleware in production.
- Add request rate limiting (e.g., `express-rate-limit`).
- Restrict static file serving to necessary paths.
- Validate `projectName` and EIDs strictly in `/notify-add-to-project`.
- Consider schema validation (e.g., `zod` or `ajv`).
- Configure CORS if serving frontend and backend on different domains.

## Secrets Management
- Store keys in `.env` for local; prefer platform secret managers in production.
- Never commit `.env`.
