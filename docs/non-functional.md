# Non-Functional Requirements

## Performance
- Target TTFB < 300ms locally for static assets.
- Chat roundtrip dominated by LLM latency; server adds minimal overhead.
- File handling is memory-only; cap per file (30k chars to LLM), total text cap (200k chars).

## Reliability
- Retries to OpenRouter (up to 3 attempts with backoff).
- Graceful error responses with `{ ok: false, error }`.

## Scalability
- Stateless server; horizontal scaling possible behind a load balancer.
- Consider external object storage if adding persistent uploads in future.

## Maintainability
- Small codebase with clear separation: frontend UI and Express routes.
- Documentation provided in `docs/` with diagrams.

## Security & Compliance
- Secrets in environment variables.
- Input validation and content-type enforcement.
- Optional email integration requires proper SMTP configuration and consent.

## Observability
- Basic stdout logging; consider structured logging in production.

## Accessibility
- Use semantic HTML; ensure buttons/labels are accessible.

## Internationalization
- Currently English-only; plan to externalize strings if needed.
