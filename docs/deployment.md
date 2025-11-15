# Deployment Guide

## Environments
- Local: Node 18+, run on `http://localhost:3000`.
- Cloud/Container: Any Node runtime; serve static `index.html` + run `server.js`.

## Prerequisites
- `.env` with at least `OPENROUTER_API_KEY`.
- Optional SMTP variables if using notify feature.

## Steps (Local)
1. `npm install`
2. Create `.env` (see below)
3. `npm start`
4. Open `http://localhost:3000`

## Example .env
```
PORT=3000
OPENROUTER_API_KEY=sk-...
OPENROUTER_MODEL=qwen/qwen3-coder:free
SYSTEM_PROMPT=You are a helpful assistant.
```

## Health Checks
- `GET /health` should return `{ ok: true }`.

## Observability
- Logs to stdout. Consider adding reverse-proxy and request logging in production.
