# Testing Strategy

## Scope
Covers manual and programmatic verification of UI flows and API endpoints.

## Manual Test Cases
- Send message without files
  - Input: message only
  - Expect: reply rendered; Send disabled during request; re-enabled after
- Send with `.txt` files
  - Input: 1–3 small .txt files
  - Expect: files echoed in server `files` response; reply displayed
- Include employees.json
  - Toggle Include; send message
  - Expect: server `diagnostics.reducedEmployees` may be true if large; reply still returns
- Large text file truncation
  - Input: >30k chars file
  - Expect: `diagnostics.truncatedFiles` includes file name
- Markdown table actions
  - Given reply with EID table
  - Expect: "Download Table" triggers file download; "Add Employees to Project" opens modal
- Notify Add to Project
  - Input: valid project name and selected EIDs
  - Expect: POST `/notify-add-to-project` returns `{ ok: true }` with sent summary (requires SMTP config)

## API Tests (cURL examples)
```bash
# Health
curl -s http://localhost:3000/health

# Upload (txt only)
curl -s -F "documents=@sample.txt;type=text/plain" http://localhost:3000/upload

# Chat
curl -s -F message="Hello" -F includeEmployees=true http://localhost:3000/chat

# Notify (requires SMTP)
curl -s -H "Content-Type: application/json" \
  -d '{"eids":["E123"],"projectName":"Alpha"}' \
  http://localhost:3000/notify-add-to-project
```

## Suggestions for Automated Tests
- Add supertest-based integration tests for Express routes.
- Mock OpenRouter API and Nodemailer transport.

## Debugging Tips
- Network tab (browser) for request/response bodies.
- Console logs for exceptions in `sendToChat()` and server routes.
- Use `GET /health` to verify server is reachable.
