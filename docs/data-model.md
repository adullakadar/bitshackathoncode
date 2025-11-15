# Data Model

## Employees Dataset
- Source: `employees.json`
- Purpose: Provide context to the model and power the Add-to-Project flow.

### Schema (canonical)
```json
{
  "employees": [
    {
      "eid": "E12345",
      "name": "Jane Doe",
      "email": "jane@example.com"
      // ... optional fields ignored by server
    }
  ]
}
```

### Notes
- Server attempts to parse both `{ employees: [...] }` or a plain array `[...]` for robustness.
- For large files, server may reduce payload to the first 10 employees with only `eid`, `name`, and `email` when size limits are exceeded.

## Request/Response Shapes

### POST /chat (Response)
```json
{
  "ok": true,
  "reply": "string",
  "files": [{ "originalname": "file.txt" }],
  "diagnostics": {
    "skippedFiles": ["image.png"],
    "truncatedFiles": ["large.txt"],
    "reducedEmployees": false
  }
}
```

### POST /notify-add-to-project (Request)
```json
{ "eids": ["E123"], "projectName": "Project X" }
```

### POST /notify-add-to-project (Response)
```json
{ "ok": true, "sent": [{ "eid": "E123", "status": "fulfilled" }] }
```
