require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { fetch } = require('undici');

const app = express();
const PORT = process.env.PORT || 3000;

// Stateless, memory-only storage for uploads (no disk persistence)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

// Serve static files (index.html, etc.)
app.use(express.static(__dirname));

// Health check
app.get('/health', (req, res) => res.json({ ok: true }));

// Upload endpoint
app.post('/upload', upload.array('documents'), (req, res) => {
  // Echo back metadata only; nothing is saved to disk
  const files = (req.files || []).map(f => ({
    originalname: f.originalname,
    size: f.size,
    mimetype: f.mimetype
  }));
  res.json({ ok: true, files, persisted: false });
});

// Chat endpoint: send text + uploaded docs + employees.json to Gemini
app.post('/chat', upload.array('documents'), async (req, res) => {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ ok: false, error: 'Missing OPENROUTER_API_KEY environment variable.' });
    }

    const userMessage = (req.body && req.body.message) || '';
    const includeEmployees = (req.body && String(req.body.includeEmployees).toLowerCase() === 'true');
    const files = req.files || [];

    // Build OpenAI-compatible messages with safeguards
    const contentParts = [];
    const diagnostics = { skippedFiles: [], truncatedFiles: [], reducedEmployees: false };
    const MAX_TOTAL_TEXT_CHARS = 200_000; // total char cap across text parts
    const MAX_PER_TEXT_FILE_CHARS = 30_000; // max chars per text-like file
    let totalTextChars = 0;
    const pushText = (txt) => {
      if (!txt) return;
      const remaining = Math.max(0, MAX_TOTAL_TEXT_CHARS - totalTextChars);
      if (remaining <= 0) return;
      const slice = txt.length > remaining ? txt.slice(0, remaining) : txt;
      contentParts.push({ type: 'text', text: slice });
      totalTextChars += slice.length;
    };
    pushText(userMessage || '');

    // Attach employees.json as text if present, with reduction when needed
    const employeesPath = path.join(__dirname, 'employees.json');
    if (includeEmployees && fs.existsSync(employeesPath)) {
      let employeesContent = fs.readFileSync(employeesPath, 'utf8');
      // If still large, reduce to first 10 employees minimal fields
      if (employeesContent.length > 200_000) {
        try {
          const parsed = JSON.parse(employeesContent);
          if (Array.isArray(parsed?.employees)) {
            const slim = { employees: parsed.employees.slice(0, 10).map(e => ({ eid: e.eid, name: e.name, email: e.email })) };
            employeesContent = JSON.stringify(slim);
            diagnostics.reducedEmployees = true;
          }
        } catch {}
      }
      pushText(`Employees JSON:\n${employeesContent}`);
    }

    // Attach uploaded files: images as image_url, text files as text, skip others
    for (const f of files) {
      try {
        const buf = f.buffer;
        if (!buf) continue;
        const mime = f.mimetype || 'application/octet-stream';
        if (mime.startsWith('image/')) {
          const b64 = Buffer.from(buf).toString('base64');
          contentParts.push({ type: 'image_url', image_url: `data:${mime};base64,${b64}` });
        } else if (mime.startsWith('text/') || mime === 'application/json' || mime === 'application/xml') {
          let text = Buffer.from(buf).toString('utf8');
          if (text.length > MAX_PER_TEXT_FILE_CHARS) {
            text = text.slice(0, MAX_PER_TEXT_FILE_CHARS);
            diagnostics.truncatedFiles.push(f.originalname);
          }
          pushText(`File: ${f.originalname}\n${text}`);
        } else {
          diagnostics.skippedFiles.push(f.originalname);
        }
      } catch (e) {
        // Skip unreadable file but continue
      }
    }

    // OpenRouter chat completions
    const url = `https://openrouter.ai/api/v1/chat/completions`;
    const model = process.env.OPENROUTER_MODEL || 'qwen/qwen3-coder:free';
    const messages = [{ role: 'user', content: contentParts }];
    const payload = { model, messages };

    async function fetchWithRetry() {
      const maxAttempts = 3;
      let lastError;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const resp = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json; charset=UTF-8',
              'Accept': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
              'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'http://localhost:3000',
              'X-Title': process.env.OPENROUTER_SITE_NAME || 'BitsTechFest'
            },
            body: JSON.stringify(payload)
          });
          const data = await resp.json().catch(() => ({ error: 'Invalid JSON response' }));
          return { resp, data };
        } catch (e) {
          lastError = e;
          if (attempt < maxAttempts) {
            await new Promise(r => setTimeout(r, 400 * attempt));
            continue;
          }
        }
      }
      throw lastError || new Error('Unknown network error');
    }

    const { resp, data } = await fetchWithRetry();
    if (!resp.ok) {
      return res.status(resp.status).json({ ok: false, error: data });
    }

    let replyText = '';
    try {
      const choice = data.choices?.[0];
      const msg = choice?.message;
      if (typeof msg?.content === 'string') {
        replyText = msg.content;
      } else if (Array.isArray(msg?.content)) {
        replyText = msg.content.map(p => p?.text).filter(Boolean).join('\n');
      }
    } catch {}

    return res.json({
      ok: true,
      reply: replyText,
      files: (files || []).map(f => ({ originalname: f.originalname })),
      diagnostics
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err?.message || 'Unknown error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
