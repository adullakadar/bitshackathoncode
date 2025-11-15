  # Flows and Sequences

## User Journey: Send Message with Files
```mermaid
sequenceDiagram
  participant U as User
  participant FE as Frontend (index.html)
  participant BE as Backend (Express)
  participant OR as OpenRouter

  U->>FE: Type message, choose .txt files, click Send
  FE->>BE: POST /chat (FormData: message, includeEmployees, files)
  BE->>BE: Build content parts, read employees.json (optional)
  BE->>OR: Chat Completions
  OR-->>BE: Reply JSON
  BE-->>FE: { ok, reply, files, diagnostics }
  FE->>FE: Render reply; detect Markdown table
  FE->>U: Show actions: Download, Add Employees to Project
```

## Flow: Download Table
```mermaid
sequenceDiagram
  participant U as User
  participant FE as Frontend

  U->>FE: Click "Download Table"
  FE->>FE: Create Blob + anchor, trigger download
```

## Flow: Add Employees to Project
```mermaid
sequenceDiagram
  participant U as User
  participant FE as Frontend
  participant BE as Backend
  participant SMTP as Mail Server

  U->>FE: Click "Add Employees to Project"
  FE->>FE: Open modal, user inputs project name, selects EIDs
  FE->>BE: POST /notify-add-to-project { eids, projectName }
  BE->>SMTP: Send emails via Nodemailer
  SMTP-->>BE: Delivery results
  BE-->>FE: { ok, sent: [ { eid, status } ] }
  FE->>U: Show toast/summary
```

## Error Handling
- **Validation**: Frontend requires message or files; backend validates `.txt` only.
- **Network/Model errors**: Displayed in UI via catch block; server returns structured error.
- **Large inputs**: Backend truncates or reduces employees payload, returns `diagnostics`.
