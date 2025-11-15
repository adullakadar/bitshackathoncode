# Troubleshooting

## Frontend
- Buttons disabled and never re-enable
  - Check browser console for errors from `sendToChat()`.
  - Ensure server is running and `/health` returns `{ ok: true }`.
- Table actions not visible
  - Ensure reply contains a proper Markdown table with an `EID` column.

## Backend
- 500 errors from /chat
  - Verify `OPENROUTER_API_KEY` is set.
  - Inspect server logs for OpenRouter response.
- SMTP errors on /notify-add-to-project
  - Confirm SMTP variables in `.env`.
  - Verify employee EIDs exist in `employees.json`.

## File Uploads
- Non-txt files rejected
  - Expected: Only `.txt` allowed. Convert files to plain text.
- Large files truncated
  - Expected: Server truncates >30k chars per file; check `diagnostics.truncatedFiles`.
