# API Reference

Base URL: `http://localhost:3000`

## GET /health
- Response: `{ ok: true }`

## POST /upload
- Form field: `documents` (array of files)
- Accepts: `.txt` only (server-side filter)
- Response (200):
```json
{ "ok": true, "files": [{ "originalname": "sample.txt", "size": 123, "mimetype": "text/plain" }], "persisted": false }
```
- Error (400): `{ "ok": false, "error": "Only .txt files are accepted." }`

## POST /chat
- Multipart form fields:
  - `message`: string
  - `includeEmployees`: `"true" | "false"`
  - `documents`: optional `.txt` files
- Behavior:
  - Reads `employees.json` if `includeEmployees` is true (with size reduction if large).
  - Builds OpenAI-compatible messages; truncates overly large inputs.
  - Calls OpenRouter with retries.
- Response (200):
```json
{ "ok": true, "reply": "...model text...", "files": [{ "originalname": "sample.txt" }], "diagnostics": { "skippedFiles": [], "truncatedFiles": [], "reducedEmployees": false } }
```
- Error (non-200 from OpenRouter): `{ "ok": false, "error": { ... } }`
- Error (500): `{ "ok": false, "error": "..." }`

## POST /notify-add-to-project
- JSON body:
```json
{ "eids": ["E123", "E456"], "projectName": "Project X" }
```
- Requires SMTP config in `.env`.
- Response (200):
```json
{ "ok": true, "sent": [{ "eid": "E123", "status": "fulfilled" }] }
```
- Error (400/404/501/500): `{ "ok": false, "error": "..." }`
