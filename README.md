# 🔍 ContractLens

An AI-powered contract analysis platform that extracts text from PDF contracts and returns instant risk assessments, plain-English summaries, and clause-by-clause breakdowns — similar to what a lawyer would charge hundreds of dollars to review.

![ContractLens](https://img.shields.io/badge/Status-Live-4ade80?style=flat-square)
![Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20Node.js%20%7C%20Groq-60a5fa?style=flat-square)

## 🎯 What It Does

Users upload any PDF contract — NDA, service agreement, employment contract — and receive an instant AI-generated report with risk scores per clause, red flags, key dates, parties involved, and actionable recommendations. Users can then ask follow-up questions about specific clauses in plain English.

## ✨ Features

- **PDF upload** — drag and drop PDF contracts up to 10MB
- **AI analysis pipeline** — multi-step LLM prompt chain extracts structured JSON from raw contract text
- **Risk scoring** — every clause is scored low, medium, or high risk with plain English explanations
- **Red flag detection** — automatically surfaces dangerous clauses before you sign
- **Follow-up Q&A** — ask natural language questions about any part of the contract
- **Analysis history** — all past analyses saved to PostgreSQL and accessible from the navbar
- **High risk banner** — prominent warning displayed for dangerous contracts

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, Tailwind CSS |
| Backend | Node.js, Express |
| AI | Groq API (Llama 3.3 70B) |
| PDF Parsing | pdf-parse |
| Database | PostgreSQL via Supabase |
| File Handling | Multer (memory storage) |

## 🏗 Architecture
```
client/                  # Next.js frontend
└── app/
    ├── components/      # UploadZone, AnalysisReport, AskQuestion, HistoryPanel
    └── page.js          # Main page with state machine (idle → loading → done)

server/                  # Node.js backend
├── routes/              # REST API endpoints
├── services/            # PDF parsing, AI analysis, database operations
└── middleware/          # Multer file upload handler
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
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

## 🧠 Technical Highlights

### Multi-step AI Pipeline
The analysis isn't a single prompt — it's a structured pipeline:
1. PDF text extraction via pdf-parse
2. Text chunking to fit within LLM context window (15,000 chars)
3. Structured JSON prompt that forces the model to return a typed schema
4. Response parsing and validation before returning to client

### Structured JSON Extraction
The system prompt instructs the LLM to return a strict JSON schema with typed fields for clauses, risk levels, parties, and dates. This makes the response directly renderable in the UI without additional processing.

### Follow-up Q&A
After analysis, the contract text is stored in Supabase. Follow-up questions retrieve the original text and send it alongside the question to the LLM — maintaining full context for accurate answers.

### In-memory File Handling
PDF files are processed entirely in memory using Multer's `memoryStorage()` — no files are written to disk, keeping the server stateless and cloud-ready.