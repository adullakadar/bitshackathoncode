# Code Overview

## Repository Structure
- `index.html`: Single-file frontend (HTML/CSS/JS) for Message Hub UI.
- `server.js`: Express server for static hosting and API endpoints.
- `employees.json`: Employee dataset (consumed when `includeEmployees` is enabled).
- `slim-employees.js`: Helper dataset file (reference or alternative form).
- `package.json`: Node dependencies and start script.
- `.env`: Environment configuration (not committed).
- `documents/`, `hardware.txt`, `e.json`: sample/support data.

## Frontend (index.html)
- Key function: `sendToChat()`
  - Builds `FormData` with `message`, `includeEmployees`, and `.txt` files.
  - Disables Send, posts to `/chat`, renders model reply, resets UI in `finally`.
  - Detects Markdown tables from reply and adds actions:
    - Download table
    - Add Employees to Project → modal → POST `/notify-add-to-project` with `{ eids, projectName }`.
- Utilities: `handleFiles`, `escapeHtml`, `formatReply`, `extractMarkdownTable`.

## Backend (server.js)
- Dependencies: `express`, `multer`, `undici` (fetch), `dotenv`, `nodemailer`.
- Middleware: `express.static(__dirname)`, `express.json()`.
- Endpoints:
  - `GET /health` → `{ ok: true }`.
  - `POST /upload` → echoes `.txt` files metadata.
  - `POST /chat` → builds content parts, reads `employees.json` if requested, truncates large inputs, calls OpenRouter with retries, returns `reply` and `diagnostics`.
  - `POST /notify-add-to-project` → validates input, looks up employees by EID, sends emails via Nodemailer.

## Running Locally
- `npm install`
- Create `.env` with required keys (see architecture.md Configuration).
- `npm start` then open `http://localhost:3000`.

## Notes
- Uploads are memory-only; no files are persisted.
- Images attached (if allowed by filter) are sent as data URLs.
- Reply parsing attempts to handle string or array content from OpenRouter.
