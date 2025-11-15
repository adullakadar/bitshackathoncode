# Contributing Guide

## Setup
- Node 18+
- `npm install`
- Create `.env` (see docs/architecture.md)
- `npm start` to run server at http://localhost:3000

## Branching & Commits
- Use feature branches.
- Conventional commit style is preferred (feat, fix, docs, refactor).

## Code Style
- Vanilla JS on frontend; keep scripts in `index.html` organized by functions.
- Backend uses Express; prefer async/await, early returns, and explicit error responses.

## Testing
- Manual testing via UI for /chat and modal flows.
- Use `GET /health` for basic readiness.

## PR Checklist
- [ ] Updated docs if behavior changed
- [ ] Tested /chat happy path and errors
- [ ] Verified table actions (download, notify)

## Security
- Never commit real API keys or SMTP credentials.
- `.txt` only uploads are enforced server-side; keep filters in sync with frontend.
