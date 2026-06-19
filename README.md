# 🔍 ContractLens

An AI-powered contract analysis platform that extracts text from PDF contracts and returns instant risk assessments, plain-English summaries, and clause-by-clause breakdowns — similar to what a lawyer would charge hundreds of dollars to review.

![ContractLens](https://img.shields.io/badge/Status-Live-4ade80?style=flat-square)
![Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20Node.js%20%7C%20Groq-60a5fa?style=flat-square)

## 🎯 What It Does

Users upload any PDF contract — NDA, service agreement, employment contract — and receive an instant AI-generated report with risk scores per clause, red flags, key dates, parties involved, and actionable recommendations. Users can then ask follow-up questions about specific clauses in plain English.

## ✨ Features

### Core Features
- **PDF upload** — drag and drop PDF contracts up to 10MB
- **Bulk upload** — upload multiple contracts at once (up to 10 files)
- **AI analysis pipeline** — multi-step LLM prompt chain extracts structured JSON from raw contract text
- **Risk scoring** — every clause is scored low, medium, or high risk with plain English explanations
- **Red flag detection** — automatically surfaces dangerous clauses before you sign
- **Follow-up Q&A** — ask natural language questions about any part of the contract
- **Analysis history** — all past analyses saved to PostgreSQL and accessible from the navbar
- **High risk banner** — prominent warning displayed for dangerous contracts

### Export & Sharing
- **PDF export** — download full analysis reports as professionally formatted PDFs
- **JSON export** — export raw analysis data for developers and integrations
- **Share links** — generate secure shareable links with optional password protection
- **Expiration control** — set custom expiration dates for shared links

### Contract Comparison
- **Side-by-side comparison** — compare two contract versions to see what changed
- **Risk tracking** — see how risk levels changed between versions
- **Clause diff** — identify added, removed, and modified clauses
- **Red flag changes** — track which red flags were added or removed

### Advanced Search & Filtering
- **Full-text search** — search across filename, summary, and clause content
- **Risk filtering** — filter analyses by risk level (low/medium/high)
- **Date range** — filter by analysis date range
- **Contract type** — filter by contract type (NDA, Service Agreement, etc.)
- **Tag filtering** — filter by custom tags
- **Folder organization** — organize contracts in folders

### Collaboration
- **Comments** — add notes and questions to specific clauses
- **Comment threads** — collaborate with team members on contract reviews
- **Edit & delete** — manage your comments over time

### Document Management
- **Tags** — add custom tags to organize contracts
- **Folders** — organize contracts into folders
- **Notes** — add personal notes to analyses
- **Templates** — save and reuse contract templates
- **Public templates** — access community-shared templates

### Notifications
- **Renewal alerts** — automatic notifications for upcoming renewal dates
- **Expiration reminders** — get alerts before contracts expire
- **Share notifications** — know when your shared links are accessed
- **Comment alerts** — get notified of new comments on your contracts
- **Email summaries** — optional email digests of notifications

### Analytics Dashboard
- **Risk trends** — visualize risk levels over time
- **Contract distribution** — see breakdown by contract type
- **Common red flags** — identify most frequent issues across your portfolio
- **Statistics** — total analyses, success rates, and more

### Integrations
- **Webhooks** — set up webhooks for real-time notifications to external systems
- **Event triggers** — trigger webhooks on analysis complete, high risk, and more
- **Signature verification** — HMAC signature verification for webhook security

### Enhanced AI Features
- **Alternative suggestions** — AI suggests safer language for risky clauses
- **Multi-language support** — translate contracts to different languages
- **Key term extraction** — automatically extract and define legal terms
- **Negotiation points** — AI generates specific negotiation strategies

### Technical Improvements
- **WebSocket support** — real-time updates for collaborative features
- **Caching layer** — improved performance with intelligent caching
- **Audit logging** — comprehensive audit trail for compliance
- **Rate limiting** — protect against abuse with configurable rate limits

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, Tailwind CSS |
| Backend | Node.js, Express |
| AI | Groq API (Llama 3.3 70B) |
| PDF Parsing | pdf-parse |
| PDF Generation | PDFKit |
| Database | PostgreSQL via Supabase |
| File Handling | Multer (memory storage) |
| Caching | Node-cache |
| Real-time | WebSocket (ws) |
| Webhooks | HMAC signature verification |

## 🏗 Architecture
```
client/                  # Next.js frontend
└── app/
    ├── components/      # UploadZone, AnalysisReport, AskQuestion, HistoryPanel
    │                   # ExportButtons, ShareButton, ComparisonView, AdvancedSearch
    │                   # CommentsPanel, NotificationsPanel, AnalyticsDashboard
    │                   # BulkUpload, EnhancedAIPanel
    └── page.js          # Main page with state machine (idle → loading → done)

server/                  # Node.js backend
├── routes/              # REST API endpoints
│   ├── contracts.js     # Contract analysis, comparison, export, sharing
│   ├── comments.js      # Comments and collaboration
│   ├── notifications.js # Notifications and alerts
│   ├── webhooks.js      # Webhook management
│   ├── enhancedAI.js    # Enhanced AI features
│   └── templates.js     # Contract templates
├── services/            # Business logic
│   ├── analyzeContract.js
│   ├── askQuestion.js
│   ├── saveAnalysis.js
│   ├── sharing.js
│   ├── export.js
│   ├── comparison.js
│   ├── comments.js
│   ├── notifications.js
│   ├── audit.js
│   ├── webhooks.js
│   ├── enhancedAI.js
│   ├── templates.js
│   ├── cache.js
│   └── websocket.js
├── middleware/          # Multer file upload, rate limiting, auth
└── database-migrations.sql  # Database schema updates
```

## 🚀 Running Locally

**Prerequisites:** Node.js 18+, Supabase account, Groq API key (free at console.groq.com)

**1. Clone the repo**
```bash
git clone https://github.com/justcoffeebean/contractlens.git
cd contractlens
```

**2. Set up the server**
```bash
cd server
npm install
```

Create `server/.env`:
```
PORT=3002
GROQ_API_KEY=your_groq_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
FRONTEND_URL=http://localhost:3000
```

**3. Set up the database**

Run this in your Supabase SQL editor:
```sql
CREATE TABLE contract_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  pages INTEGER,
  contract_text TEXT,
  analysis JSONB NOT NULL,
  user_id UUID,
  tags TEXT[],
  folder TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

Then run the full migration:
```bash
# Copy the contents of server/database-migrations.sql
# and run it in your Supabase SQL editor
```

**4. Start the server**
```bash
npm run dev
```

**5. Set up and start the client**
```bash
cd ../client
npm install
npm run dev
```

Visit `http://localhost:3000`

## 📡 API Endpoints

### Contracts
- `POST /api/contracts/analyze` — Analyze a single contract
- `POST /api/contracts/bulk` — Bulk upload and analyze multiple contracts
- `POST /api/contracts/compare` — Compare two contract versions
- `GET /api/contracts` — Get all user's analyses
- `GET /api/contracts/:id` — Get a specific analysis
- `GET /api/contracts/:id/export/pdf` — Export analysis as PDF
- `GET /api/contracts/:id/export/json` — Export analysis as JSON
- `POST /api/contracts/:id/share` — Generate share link
- `GET /api/contracts/shared/:token` — Access shared analysis
- `DELETE /api/contracts/:id/share/:token` — Revoke share link
- `GET /api/contracts/shares/list` — Get user's share links
- `PUT /api/contracts/:id` — Update analysis metadata
- `DELETE /api/contracts/:id` — Delete analysis
- `GET /api/contracts/search` — Advanced search
- `GET /api/contracts/stats` — Get analytics statistics
- `POST /api/contracts/:id/ask` — Ask follow-up question

### Comments
- `POST /api/comments` — Add comment
- `GET /api/comments/:analysisId` — Get comments for analysis
- `PUT /api/comments/:id` — Update comment
- `DELETE /api/comments/:id` — Delete comment

### Notifications
- `GET /api/notifications` — Get user notifications
- `PUT /api/notifications/:id/read` — Mark as read
- `PUT /api/notifications/read-all` — Mark all as read
- `DELETE /api/notifications/:id` — Delete notification
- `POST /api/notifications/check-renewals` — Check renewal dates

### Webhooks
- `POST /api/webhooks` — Create webhook
- `GET /api/webhooks` — Get user's webhooks
- `PUT /api/webhooks/:id` — Update webhook
- `DELETE /api/webhooks/:id` — Delete webhook

### Enhanced AI
- `POST /api/enhanced-ai/suggest-alternative` — Suggest alternative clause language
- `POST /api/enhanced-ai/translate` — Translate contract
- `POST /api/enhanced-ai/extract-terms` — Extract key terms
- `POST /api/enhanced-ai/negotiation-points` — Generate negotiation points

### Templates
- `POST /api/templates` — Create template
- `GET /api/templates` — Get user's templates
- `GET /api/templates/public` — Get public templates
- `GET /api/templates/:id` — Get specific template
- `PUT /api/templates/:id` — Update template
- `DELETE /api/templates/:id` — Delete template

## 🔐 Security Features

- **JWT Authentication** — Secure token-based authentication
- **Rate Limiting** — Protect against abuse with configurable limits
- **Password Protection** — Optional password for shared links
- **HMAC Signatures** — Webhook signature verification
- **Row Level Security** — Database-level access control
- **Audit Logging** — Comprehensive action tracking
- **Input Validation** — Sanitization and validation on all inputs

## 🚀 Deployment

The application is designed for easy deployment:

- **Frontend**: Deploy to Vercel, Netlify, or any Node.js host
- **Backend**: Deploy to Render, Railway, or any Node.js host
- **Database**: Supabase handles database hosting
- **WebSocket**: Supported on any platform that supports WebSockets

See individual deployment platform documentation for specific instructions.

## 🧠 Technical Highlights

### Multi-step AI Pipeline
The analysis isn't a single prompt — it's a structured pipeline:
1. PDF text extraction via pdf-parse
2. Text chunking to fit within LLM context window (15,000 chars)
3. Structured JSON prompt that forces the model to return a typed schema
4. Response parsing and validation before returning to client
5. Second-pass red flag hunt for comprehensive risk detection

### Structured JSON Extraction
The system prompt instructs the LLM to return a strict JSON schema with typed fields for clauses, risk levels, parties, and dates. This makes the response directly renderable in the UI without additional processing.

### Follow-up Q&A
After analysis, the contract text is stored in Supabase. Follow-up questions retrieve the original text and send it alongside the question to the LLM — maintaining full context for accurate answers.

### In-memory File Handling
PDF files are processed entirely in memory using Multer's `memoryStorage()` — no files are written to disk, keeping the server stateless and cloud-ready.

### Real-time Updates
WebSocket server provides real-time notifications for:
- Analysis completion
- New comments
- High-risk alerts
- Share link creation

### Caching Layer
Node-cache provides intelligent caching for:
- Analysis results
- User data
- Shared analyses
- Template content

### Audit Logging
Comprehensive audit trail tracks:
- User actions (view, export, share, delete)
- IP addresses and user agents
- Timestamps for compliance

### Webhook System
Secure webhook delivery with:
- HMAC signature verification
- Event filtering
- Retry logic
- Last-triggered tracking