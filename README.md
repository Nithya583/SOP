# AI Legal Guardian (एआई लीगल गार्जियन)

A privacy-first, production-minded legal document comprehension web application engineered specifically for Indian citizens. It demystifies complex legal contracts, rental agreements, employment paperwork, notices, and commercial agreements into plain language across **16 Indian languages**.

---

## ⚖️ Mandatory Statutory Legal Disclaimer

> **AI Legal Guardian provides general legal information and AI-generated explanations for educational purposes only. It is not a law firm and does not provide legal representation or a substitute for advice from a qualified advocate in India. AI analysis may be incomplete or inaccurate. Always verify important legal matters with a licensed professional before signing a document or taking legal action.**

---

## 🌟 Core Product Features

* **No Login or Account Required:** Zero registration, zero email/phone collection, and zero subscription paywalls.
* **Zero Persistent Storage:** No databases or persistent tracking. Uploaded documents, extracted text, analyses, and voice recordings live strictly in transient RAM memory during your active session.
* **Automatic TTL Expiration & Immediate Deletion:** Sessions automatically expire and purge after 30 minutes of inactivity. Users can immediately wipe individual documents or trigger "End Session & Clear All Data".
* **Real AI Document Analysis:** Powered by Google Gemini 2.5 Flash / OpenAI models with strict grounding and untrusted-input security constraints. Identifies obligations, key dates, financial penalties, and classified risks (Low, Medium, High).
* **100% Free Translation & AI Legal Nuance Translation:** Features a built-in zero-API-key Free Google Neural Translation engine supporting all 16 Indian languages instantly, alongside Gemini AI Legal Translation for deep contextual clause analysis.
* **Document-Aware Legal Chatbot:** Grounded chatbot providing clause citations, explaining legalese, and distinguishing document facts from general legal concepts.
* **High-Precision Multilingual Voice Assistant:** High-fidelity speech recognition powered by Google Gemini 2.5 multimodal audio AI and Whisper with noise suppression, echo cancellation, and real-time live preview. Listen to legal explanations read aloud via cloud TTS or browser speech.
* **Truthful Capability Reporting:** Never fabricates fake AI results. If API credentials are not configured or if a cloud provider does not support a specific language dialect, the system transparently and truthfully reports it with actionable guidance.

---

## 🇮🇳 Supported Languages & Capabilities Matrix

The application provides complete interface localization and capability checking for 16 Indian languages:

| # | Language | Code | Native Name | Script | Direction | Analysis (LLM) | Translation | Speech Recognition (STT) | Text-to-Speech (TTS) |
|---|----------|------|-------------|--------|-----------|----------------|-------------|--------------------------|----------------------|
| 1 | **English** | `en` | English | Latin | LTR | ✅ Supported | ✅ Supported | ✅ Whisper & Browser | ✅ OpenAI & Browser |
| 2 | **Hindi** | `hi` | हिन्दी | Devanagari | LTR | ✅ Supported | ✅ Supported | ✅ Whisper & Browser | ✅ OpenAI & Browser |
| 3 | **Tamil** | `ta` | தமிழ் | Tamil | LTR | ✅ Supported | ✅ Supported | ✅ Whisper & Browser | ✅ OpenAI & Browser |
| 4 | **Telugu** | `te` | తెలుగు | Telugu | LTR | ✅ Supported | ✅ Supported | ✅ Whisper & Browser | ✅ OpenAI & Browser |
| 5 | **Malayalam** | `ml` | മലയാളം | Malayalam | LTR | ✅ Supported | ✅ Supported | ✅ Whisper & Browser | ✅ OpenAI & Browser |
| 6 | **Kannada** | `kn` | ಕನ್ನಡ | Kannada | LTR | ✅ Supported | ✅ Supported | ✅ Whisper & Browser | ✅ OpenAI & Browser |
| 7 | **Bengali** | `bn` | বাংলা | Bengali | LTR | ✅ Supported | ✅ Supported | ✅ Whisper & Browser | ✅ OpenAI & Browser |
| 8 | **Marathi** | `mr` | मराठी | Devanagari | LTR | ✅ Supported | ✅ Supported | ✅ Whisper & Browser | ✅ OpenAI & Browser |
| 9 | **Gujarati** | `gu` | ગુજરાતી | Gujarati | LTR | ✅ Supported | ✅ Supported | ✅ Whisper & Browser | ✅ OpenAI & Browser |
| 10 | **Punjabi** | `pa` | ਪੰਜਾਬੀ | Gurmukhi | LTR | ✅ Supported | ✅ Supported | ✅ Whisper & Browser | ✅ OpenAI & Browser |
| 11 | **Odia** | `or` | ଓଡ଼ିଆ | Odia | LTR | ✅ Supported | ✅ Supported | ⚠️ Experimental/Text | ⚠️ Browser Voice |
| 12 | **Assamese** | `as` | অসমীয়া | Bengali-Assamese | LTR | ✅ Supported | ✅ Supported | ⚠️ Experimental/Text | ⚠️ Browser Voice |
| 13 | **Urdu** | `ur` | اردو | Arabic-Nastaliq | **RTL** | ✅ Supported | ✅ Supported | ✅ Whisper & Browser | ✅ OpenAI & Browser |
| 14 | **Sanskrit** | `sa` | संस्कृतम् | Devanagari | LTR | ✅ Supported | ✅ Supported | ⚠️ Limited Models | ⚠️ Browser Voice |
| 15 | **Nepali** | `ne` | नेपाली | Devanagari | LTR | ✅ Supported | ✅ Supported | ✅ Whisper & Browser | ✅ OpenAI & Browser |
| 16 | **Konkani** | `kok`| कोंकणी | Devanagari | LTR | ✅ Supported | ✅ Supported | ⚠️ Unsupported Cloud | ⚠️ Browser Voice |

---

## 🛠️ Technology Stack

### Backend
* **Python 3.11+ / 3.12**
* **FastAPI** — High-performance asynchronous REST API framework
* **Pydantic v2 & Pydantic-Settings** — Strict schema validation
* **Uvicorn** — ASGI web server
* **pypdf** — Digital PDF text extraction, encryption detection, and scanned PDF heuristics
* **python-docx** — Microsoft Word document parsing (paragraphs and tables)
* **OpenAI SDK & HTTPX** — Real cloud integrations for GPT-4o-mini, Whisper-1, and TTS-1

### Frontend
* **React 19 & TypeScript**
* **Vite** — Next-generation frontend build tooling
* **Tailwind CSS v4** — Modern utility styling with custom brand tokens
* **i18next & react-i18next** — Complete interface localization across 16 languages
* **Lucide React** — Crisp legal and interface iconography
* **Vitest & React Testing Library** — Comprehensive unit and component testing

---

## 🚀 Quickstart & Setup Guide

### 1. Prerequisites
* **Node.js** v18+ (tested on Node v24.x)
* **Python** v3.11+ (tested on Python 3.12.x)

---

### 2. Backend Setup

Open **Terminal 1**:

```powershell
# Navigate to the backend directory
cd backend

# Create and activate Python virtual environment
# On Windows PowerShell:
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# On Linux / macOS:
# python3 -m venv .venv
# source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
Copy-Item .env.example .env
# Edit .env and supply your OPENAI_API_KEY (and optional GOOGLE_TRANSLATION_API_KEY)

# Start FastAPI development server
python -m uvicorn app.main:app --reload --port 8000
```

The backend API will start at: `http://127.0.0.1:8000`  
Interactive Swagger docs: `http://127.0.0.1:8000/docs`

---

### 3. Frontend Setup

Open **Terminal 2**:

```bash
# Navigate to the frontend directory
cd frontend

# Install npm dependencies
npm install

# Start Vite development server
npm run dev
```

The application will be live at: `http://localhost:5173`

*(Vite dev proxy is pre-configured to forward all `/api/*` calls directly to the FastAPI server at `http://127.0.0.1:8000`).*

---

## 🔑 Environment Configuration (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `GEMINI_API_KEY` | **Google Gemini Free Tier Key** (Get free at https://aistudio.google.com/apikey - no credit card required) | Recommended Free Option |
| `OPENAI_API_KEY` | OpenAI API key for Document Analysis, Grounded Chat, Whisper STT, and TTS | Optional Alternative |
| `GOOGLE_TRANSLATION_API_KEY` | Optional Google Cloud Translation v2 key | Optional (LLM fallback used if omitted) |
| `HOST` | Backend host address | `127.0.0.1` |
| `PORT` | Backend port number | `8000` |
| `CORS_ORIGINS` | Allowed frontend origins | `http://localhost:5173,http://127.0.0.1:5173` |
| `SESSION_TTL_MINUTES` | Inactivity minutes before temporary memory auto-purges | `30` |
| `MAX_UPLOAD_SIZE_MB` | Maximum document upload size | `10` |

---

## 🧪 Running Automated Tests

### Backend Tests (pytest)
Runs 13 tests covering document parsing (PDF, DOCX, TXT), empty/corrupt document validation, session lifecycle and TTL cleanup, honest missing API key error reporting, and speech capability checking:

```powershell
cd backend
.\.venv\Scripts\python -m pytest -v
```

### Frontend Tests (Vitest)
Runs 7 tests covering homepage rendering, trust badges, format validation in uploaders, RiskCard rendering and expansion, translation panel, voice capability limitations, and privacy controls modal:

```bash
cd frontend
npm test
```

### Production Frontend Build
Validates TypeScript typings, CSS generation, and production bundling:

```bash
cd frontend
npm run build
```

---

## 🔒 Privacy & Data Retention Architecture

1. **Ephemeral RAM Processing:** Document contents and chat dialogues exist exclusively in memory within a thread-safe `SessionManager`. No database engines (SQLite, Postgres, MongoDB, etc.) are used or connected.
2. **Deterministic Cleanup:**
   * When an individual document is removed, its extracted text and temporary files are deleted immediately.
   * When "End Session & Clear All Data" is triggered, all session records and artifacts are destroyed.
   * Periodic background tasks monitor session inactivity and purge records older than `SESSION_TTL_MINUTES`.
3. **Browser Storage Policy:**
   * Sensitive document text, analyses, transcripts, and chat dialogues are **never** written to `localStorage`, `sessionStorage`, or `IndexedDB`.
   * Only the non-sensitive UI language choice (e.g., `'hi'`, `'ta'`) is retained for user convenience.
4. **Third-Party Provider Disclosure:**
   * While server-side and client-side data is expunged immediately upon user deletion, external providers (such as OpenAI) retain API request logs under their own standard enterprise security terms (typically up to 30 days for abuse monitoring before automatic deletion).
