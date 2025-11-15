# SyncLab Assistant (Bits Tech Fest)

An AI-assisted web app to analyze `.txt` documents, chat with an LLM (via OpenRouter), and extract an Employees table that you can download or use to email individuals directly from a modal UI.

## Features
- **Chat with AI** using OpenRouter
- **.txt uploads** (client + server enforced)
- **Markdown reply rendering** with safe HTML escaping
- **Employees table detection** from LLM reply
  - Robust parsing of Markdown tables (handles code fences, alignment colons, leading/trailing pipes, light markdown in cells)
  - Flexible header matching for `EID/ID`, `Name`, `Email`
- **Download table** as a text file
- **Add Employees to Project** modal
  - Shows parsed `EID | Name | Email`
  - Project name input
  - Per-employee Gmail compose buttons

## Tech Stack
- Frontend: Vanilla HTML/CSS/JS
- Backend: Node.js + Express + Multer
- LLM: OpenRouter API (model configurable via `.env`)

## Getting Started

### Prerequisites
- Node.js 18+
- An OpenRouter API key: https://openrouter.ai/

### Install
```bash
npm install
```

### Environment
Create a `.env` file in the project root:
```
OPENROUTER_API_KEY=sk-or-v1-...your-key...
PORT=3000
OPENROUTER_MODEL=openai/gpt-oss-120b
SYSTEM_PROMPT="You are SyncLab Assistant. Be helpful, concise, and neutral. Whenever asked to return any employees table, present it as a clean Markdown table and always include an 'EID' column as the first column. Use readable column headers and include no raw JSON or extra explanatory text inside the table. Outside the table, you may provide a one-line summary."
```

Notes:
- Do NOT commit real API keys to version control.
- You can freely modify `SYSTEM_PROMPT` to guide the model’s output style (e.g., always produce a Markdown table with `EID | Name | Email`).

### Run
```bash
npm start
# Server running at http://localhost:3000
```
Open http://localhost:3000 in your browser.

## Usage
1. Type a message asking for an employee list (e.g., “List potential team members with EID, Name, Email”).
2. Optionally upload `.txt` files to provide context. `.txt` is accepted.
3. Submit. The reply is rendered with simple Markdown formatting.
4. If the reply contains a Markdown table, you’ll see:
   - **Download Table**: saves only the table as `employees-table.txt`.
   - **Add Employees to Project**: opens a modal displaying the parsed table.
5. In the modal:
   - Enter a project name (optional).
   - Click **Email** next to a person to open Gmail compose with prefilled to/subject/body.

## API Endpoints
- `GET /health` → `{ ok: true }` for health checks
- `POST /upload` → In-memory `.txt` file acceptance check (used internally)
- `POST /chat` → Core endpoint: forwards text + files to LLM and returns structured reply

## Implementation Notes
- File uploads are processed in-memory via Multer; nothing is persisted.
- Reply rendering uses `escapeHtml` and `formatReply` to prevent HTML injection.
- Table detection is resilient to:
  - Code fences around tables (``` blocks)
  - Alignment patterns like `| :--- | ---: |`
  - Leading/trailing pipes per row
  - Mild markdown within cells (bold, code)
- Column alignment is normalized so EID/Name/Email line up with headers.

## Customizing the System Prompt
Edit `.env` → `SYSTEM_PROMPT`. Suggested guidance:
- Ask the model to always include a Markdown table with the first column named `EID`.
- Keep one-line summaries outside the table.

## Project Structure
```
BitsTechFest/
├─ index.html        # Frontend UI + chat client + table parsing + modal
├─ server.js         # Express server, OpenRouter integration, endpoints
├─ package.json      # Scripts and dependencies
├─ .env              # Local environment variables (not committed)
└─ README.md         # This file
```

## Scripts
- `npm start` → start the Express server

## Troubleshooting
- Button not visible:
  - Ensure the LLM replied with a proper Markdown table (header row, separator row, then data rows).
  - Refresh the browser after making code changes.
- “.txt files are accepted”:
  - The backend enforces `.txt`. Convert other files to plain text before uploading.
- Emails not opening:
  - The app uses a Gmail compose URL. Ensure you’re logged into Gmail in the browser.

## Security
- Keep your `OPENROUTER_API_KEY` private and out of version control.
