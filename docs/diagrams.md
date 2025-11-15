# Diagrams

This document centralizes system, component, sequence, and data diagrams. Render with Mermaid-compatible viewers (e.g., GitHub, VS Code).

## System Context
```mermaid
C4Context
title System Context - BitsTechFest
Person(user, "End User", "Sends messages, uploads files")
System(spa, "Message Hub UI", "index.html single-page app")
System(api, "Express API", "Node.js server")
System_Ext(openrouter, "OpenRouter", "LLM chat completions")
SystemDb(employees, "employees.json", "Local JSON dataset")

Rel(user, spa, "Uses via browser")
Rel(spa, api, "HTTP: /chat, /upload, /notify-add-to-project")
Rel(api, openrouter, "HTTPS: chat completions")
Rel(api, employees, "Reads JSON")
```

## Component Diagram (Backend)
```mermaid
flowchart LR
  subgraph Express Server
    Router[Express Router]
    Multer[Multer .txt Filter]
    Chat[Chat Controller]
    Notify[Notify Controller]
    OpenRouterClient[OpenRouter Client (undici)]
    Mailer[Nodemailer Transport]
  end
  Employees[(employees.json)]
  OpenRouter[(OpenRouter API)]

  Router --> Multer
  Multer --> Chat
  Chat --> OpenRouterClient
  Chat --> Employees
  Router --> Notify
  Notify --> Employees
  Notify --> Mailer
  OpenRouterClient --> OpenRouter
```

## Sequence: /chat End-to-End
```mermaid
sequenceDiagram
  participant U as User
  participant FE as Frontend
  participant BE as Express
  participant OR as OpenRouter

  U->>FE: Enter message + choose files
  FE->>BE: POST /chat (FormData)
  BE->>BE: Build content parts + diagnostics
  BE->>OR: Chat Completions
  OR-->>BE: JSON { choices }
  BE-->>FE: { ok, reply, files, diagnostics }
  FE->>U: Render reply; actions if table
```

## Sequence: Notify Add to Project
```mermaid
sequenceDiagram
  participant U as User
  participant FE as Frontend
  participant BE as Express
  participant SMTP as Mail Server

  U->>FE: Click Add Employees, enter project
  FE->>BE: POST /notify-add-to-project
  BE->>BE: Validate + lookup EIDs
  BE->>SMTP: Send emails via Nodemailer
  SMTP-->>BE: Results
  BE-->>FE: { ok, sent }
```

## Data Model (High Level)
```mermaid
classDiagram
  class Employee {
    +string eid
    +string name
    +string email
    +... other optional fields
  }
  class EmployeesJson {
    +Employee[] employees
  }
```
