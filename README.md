
# ShilpSaathi (शिल्पसाथी)

> **Your Craft. Your Story. Your Market.**  
> *AI-Powered Virtual Business Manager for Marginalized Artisans*

[![Theme](https://img.shields.io/badge/Theme-Heritage%20%26%20Culture-A44932?style=flat-square)](#)
[![Ministry](https://img.shields.io/badge/Ministry-Social%20Justice%20%26%20Empowerment-D4A72C?style=flat-square)](#)
[![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20PWA%20%7C%20PostgreSQL-3F7D58?style=flat-square)](#)

Live Link : https://shilpsaathi.vercel.app/
---

## 📌 Executive Summary

India has millions of generational artisans producing world-class heritage handicrafts. However, their ability to earn sustainable online livelihoods is obstructed by three critical non-financial barriers:

1. **Visual Barrier:** Poor lighting, lack of studio equipment, and cluttered backgrounds yield photos unsuitable for modern e-commerce standards.
2. **Language Barrier:** Artisans are fluent in regional dialects and speech, but lack the technical English literacy required to draft search-optimized, professional product listings.
3. **Pricing Asymmetry:** Artisans have limited visibility into urban retail and online benchmark rates, resulting in underpricing relative to their hours and raw material costs.

**ShilpSaathi** solves this with a zero-typing, voice-and-visual-first Progressive Web Application (PWA). An artisan takes a photo, speaks naturally in Hindi or their native dialect, and receives an enhanced, bilingual (Hindi + English), market-ready digital product listing with heuristic fair-price recommendations.

---

## 🏛 Core Workflow

```text
[Capture Product] ➔ [AI Image Studio] ➔ [Voice Input (BHASHINI)] ➔ [AI Generated Catalog] ➔ [Pricing Assistant] ➔ [Human Review] ➔ [Share / Publish]

```

* **Step 1: Capture Product** — Simple camera access with zero complex settings.
* **Step 2: AI Image Studio** — Background isolation, clutter removal, and studio lighting normalization. *(Pending AI implementation — currently stores original image)*
* **Step 3: Voice Cataloging** — Hands-free Hindi tap-to-speak input powered by BHASHINI. *(Pending BHASHINI integration — voice recording works)*
* **Step 4: AI Auto-Cataloger** — LLM-structured title, category, material, and bilingual descriptions. *(Pending Gemini/LLM integration — manual catalog editing available)*
* **Step 5: Hybrid Pricing Engine** — Transparent price range recommendation based on material cost and craft complexity. *(Heuristic pricing implemented)*
* **Step 6: Review & Publish** — Full artisan override control before generating shareable digital cards.

---

## 🎨 Design System & UI Principles

The interface adopts a craft-inspired, earthy palette avoiding generic corporate SaaS aesthetics:

| Role | Colour | Hex | Usage |
| --- | --- | --- | --- |
| **Primary** | Deep Terracotta | `#A44932` | Key buttons, active states, brand headers |
| **Secondary** | Muted Mustard | `#D4A72C` | AI indicators, smart badges, highlights |
| **Background** | Warm Ivory | `#FFF9F0` | Non-fatiguing base background canvas |
| **Text** | Deep Charcoal | `#292524` | Primary high-contrast body typography |
| **Success** | Natural Forest Green | `#3F7D58` | Confirmation badges, published cards |

### 5 Foundational UI Principles

1. **One Primary Action Per Screen:** Prevents cognitive overload; user never guesses next steps.
2. **Visual First:** Cards, clean product imagery, and recognizable icons over text paragraphs.
3. **Progressive Disclosure:** Reveals only the input/information needed for the current step.
4. **AI Transparency:** Clear, reassuring states (`"Enhancing your photo..."`) rather than opaque loading spinners.
5. **Artisan Control:** AI never finalizes listings silently; all suggestions remain fully editable.

---

## 📱 Why PWA (Progressive Web App)?

Judges and evaluators frequently ask why ShilpSaathi was structured as a PWA rather than a native `.apk` on Google Play:

* **Zero App-Store Friction:** Artisans do not need Google Play accounts, Apple IDs, or multi-step app store downloads.
* **Ultra-Lightweight Footprint:** Standard native e-commerce applications consume 60MB–150MB of storage. ShilpSaathi installs as a standalone PWA in under 2MB, making it practical for budget smartphones.
* **Instant WhatsApp Distribution:** Self-Help Groups (SHGs) and Ministry field coordinators can distribute the app via an instant URL or QR code.
* **Hardware Interoperability:** Grants direct access to the camera and microphone via web standards while remaining decoupled to wrap into React Native/Flutter for future native deployments.

---

## 🛠 System Architecture & Tech Stack

```text
               +-------------------------------------------+
               |            Artisan Smartphone             |
               |         (React + Tailwind PWA Shell)      |
               +---------------------+---------------------+
                                     |  HTTPS REST
                                     v
               +---------------------+---------------------+
               |          Node.js / Express Backend        |
               |   (Authentication, Validation, Pipelines) |
               +---+-----------------+-----------------+---+
                   |                 |                 |
                   v                 v                 v
           +---------------+ +---------------+ +---------------+
           |   Image AI    | |   BHASHINI    | |   PostgreSQL  |
           | Pipeline      | |  + GenAI LLM  | |  (via Supabase|
           | (Sharp / BG)  | |  (Voice-Text) | |  DB & Storage)|
           +---------------+ +---------------+ +---------------+

```

* **Frontend:** React, Tailwind CSS (v3), Lucide Icons, Vite PWA Plugin.
* **Backend:** Node.js, Express.js (REST APIs, server-side credential isolation).
* **Database & Storage:** PostgreSQL via Supabase with binary asset storage.
* **Multilingual AI:** Government-backed BHASHINI for Indian-language speech-to-text and translation.
* **Generative Engine:** LLM pipeline structuring unstructured voice into standardized catalog entities.
* **Pricing Engine:** Hybrid heuristic calculation (Raw Material Cost + Hours Worked × Craft Complexity Markup).

---

## 🗄 Database Schema (PostgreSQL / Supabase)

Run `server/src/db/schema.sql` in the Supabase SQL Editor to create these tables.

```sql
-- Enable UUID extension (usually enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Artisans / Users table
CREATE TABLE IF NOT EXISTS artisans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    preferred_language VARCHAR(50) DEFAULT 'hi',
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Catalog Items
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artisan_id UUID REFERENCES artisans(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    material VARCHAR(100),
    colour VARCHAR(100),
    craft_type VARCHAR(100),
    description_hi TEXT,
    description_en TEXT,
    keywords TEXT[],
    original_image_url TEXT,
    image_url TEXT NOT NULL,
    price_min NUMERIC(10, 2),
    price_max NUMERIC(10, 2),
    final_price NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'published',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Processing Pipeline Logs
CREATE TABLE IF NOT EXISTS processing_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    operation VARCHAR(50) NOT NULL, -- 'image_enhance', 'voice_transcription', 'pricing'
    status VARCHAR(50) NOT NULL,    -- 'pending', 'completed', 'failed'
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_products_artisan_id ON products(artisan_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_processing_logs_product_id ON processing_logs(product_id);

-- Insert a demo artisan for development
INSERT INTO artisans (name, phone, preferred_language, location)
VALUES ('Demo Artisan', '0000000000', 'hi', 'India')
ON CONFLICT (phone) DO NOTHING;
```

### Relationships

* **One Artisan → Many Products** (`artisans.id` → `products.artisan_id`)
* **One Product → Many Processing Logs** (`products.id` → `processing_logs.product_id`)
* Cascading deletes: deleting an artisan deletes all their products; deleting a product deletes all its processing logs

---

## 🚀 Getting Started

### Prerequisites

* Node.js (`v18.x` or `v20.x` recommended)
* npm (`v9.x` or higher)
* A Supabase project (for database and storage)

### 1. Set Up Backend

```bash
# Navigate to server
cd server

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Start Express server
npm start
# Or for development with auto-reload:
npm run dev
# Running on http://localhost:5000
```

### 2. Set Up Frontend

```bash
# From project root
npm install

# Optional: create .env to customize backend URL
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Start Vite dev server
npm run dev
# Running on http://localhost:5173
```

### 3. Configure Supabase

1. Create a Supabase project at https://supabase.com
2. Open **SQL Editor** and run the contents of `server/src/db/schema.sql`
3. Go to **Storage**, create a bucket named `product-images`, and make it **Public**
4. Copy your Supabase URL and service-role key into `server/.env`
5. Restart the backend

### 4. Test PWA on Mobile

1. Ensure your laptop and phone are on the same local network.
2. Open Chrome on Android or Safari on iOS and enter the `http://<laptop-ip>:5173` URL.
3. Tap **"Install ShilpSaathi"** or **"Add to Home Screen"** to run full-screen without address bars.

---

## 👥 Team Roles

| Member | Domain | Key Responsibilities |
| --- | --- | --- |
| **Shakti** | Team Lead & Presentation | Pitch narrative, product vision, demo presentation, slides delivery |
| **Harshit** | Frontend & PWA | React screen flows, PWA service worker, camera/mic bindings, API consumption |
| **Somesh** | Backend & Database | Express APIs, Supabase PostgreSQL, file storage schemas, data validation |
| **Shiva** | AI Integration | BHASHINI speech integration, LLM prompt engineering, background cleanup pipeline |
| **Piyush** | QA & Content | Demo catalog sample data, Hindi/English terminology checks, test scenarios |

---

## 🗺 Roadmap

* [x] **Phase 1 (Backend Foundation):** Express API, Product CRUD, Artisan CRUD, Supabase PostgreSQL, Supabase Storage, image upload, validation, error handling
* [ ] **Phase 2:** Frontend finalization and full integration testing
* [ ] **Phase 3:** AI integrations — BHASHINI, Gemini, AI image enhancement, AI pricing
* [ ] **Phase 4:** Direct GeM (Government e-Marketplace) and ONDC (Open Network for Digital Commerce) API adapters for 1-click publishing.
* [ ] **Phase 5:** B2B direct artisan-to-exporter bulk discovery dashboard with logistics handoff.
* [ ] **Phase 6:** Production hardening and deployment.

---

## 🗺 Project Status

| Area | Status |
| --- | --- |
| Backend foundation (Express + Supabase) | Implemented & verified |
| Product CRUD (PostgreSQL) | Implemented & verified |
| Artisan CRUD (PostgreSQL) | Implemented & verified |
| Supabase Storage (image upload) | Implemented & verified |
| Product listing endpoint | Implemented & verified |
| Product status management | Implemented & verified |
| Input validation | Implemented & verified |
| Error handling | Implemented & verified |
| Heuristic pricing | Implemented |
| Frontend → Backend integration | Implemented |
| BHASHINI transcription | Pending (stub preserved) |
| Gemini catalog generation | Pending (stub preserved) |
| AI pricing intelligence | Pending (stub preserved) |
| AI image enhancement | Pending (stub preserved) |

---

## 🏗 Architecture

```
Frontend (React PWA)
   ↓ HTTP (JSON / multipart)
Node.js + Express Backend
   ↓
Controller → Service → Supabase Client
                     ↓
              ┌──────┴──────┐
              ↓             ↓
     PostgreSQL DB     Storage Bucket
     (artisans,        (product-images)
      products,
      processing_logs)
```

**Responsibilities:**

* **Frontend (React PWA):** Renders the 9-screen artisan workflow. Communicates with the backend via HTTP. Handles camera/mic access, local state, and user interactions.
* **Express Backend:** Receives requests, validates input, enforces ownership rules, and routes to the appropriate service. Never exposes Supabase credentials.
* **Supabase:** Provides PostgreSQL database for structured data and object storage for product images.
---

## 🛠 Technology Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite, Tailwind CSS 3, PWA (vite-plugin-pwa), Lucide Icons |
| Backend | Node.js, Express 5 |
| Database | PostgreSQL via Supabase |
| Storage | Supabase Storage (binary asset storage) |
| File Upload | Multer 2.x (memory storage) |
| Config | dotenv |
| Validation | Custom middleware |

---

## 📁 Repository Structure

```text
shilpsaathi/
├── src/                          # Frontend (React PWA)
│   ├── screens/                  # 9 workflow screens
│   ├── components/               # Header, BottomNav, LoadingOverlay, ProgressDots
│   ├── context/                  # CraftContext (global state)
│   ├── utils/
│   │   ├── api.js                # Frontend API client
│   │   └── speech.js             # TTS utilities
│   ├── App.jsx
│   └── main.jsx
├── server/                       # Backend (Express)
│   ├── src/
│   │   ├── config/               # Environment config, Supabase client
│   │   ├── controllers/          # Request handlers
│   │   ├── middleware/           # Error handler, upload config
│   │   ├── routes/               # API route definitions
│   │   ├── services/             # Database operations
│   │   ├── utils/                # Response helpers, validation
│   │   ├── db/
│   │   │   └── schema.sql        # Database schema
│   │   └── app.js                # Express app setup
│   ├── package.json
│   ├── .env.example
│   └── index.js                  # Server entry point
├── public/                       # Static assets
├── .gitignore
├── package.json                  # Frontend dependencies
└── README.md
```

---

## 🔐 Environment Variables

### Backend (`server/.env`)

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | Server port (default: `5000`) |
| `NODE_ENV` | No | Environment: `development` or `production` |
| `SUPABASE_URL` | Yes | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes* | Supabase service-role key (server-only) |
| `SUPABASE_ANON_KEY` | Yes* | Supabase anon key (fallback if service-role not set) |
| `SUPABASE_STORAGE_BUCKET` | No | Storage bucket name (default: `product-images`) |
---

## 📡 API Documentation

**Base URL:** `http://localhost:5000/api`

**Standard response format:**

Success:
```json
{
  "success": true,
  "message": "Descriptive message",
  "data": { ... }
}
```

Error:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

### Product APIs

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/products` | List products (optional `?artisan_id=` filter) |
| `POST` | `/api/products` | Create product |
| `GET` | `/api/products/:id` | Get single product |
| `PUT` | `/api/products/:id` | Update product (partial) |
| `DELETE` | `/api/products/:id` | Delete product |
| `GET` | `/api/products/:id/listing` | Get full listing with artisan info |
| `PATCH` | `/api/products/:id/status` | Update product status |

**Create Product — Required fields:** `name`, `image_url`, `final_price`

**Create Product — Optional fields:** `category`, `material`, `colour`, `craft_type`, `description_hi`, `description_en`, `keywords` (string[]), `price_min`, `price_max`, `original_image_url`, `artisan_id` (UUID), `status` (`draft`/`published`/`archived`)

**Success:** `201` with product object | **Errors:** `422` (validation), `400` (bad request), `503` (DB not configured)

---

### Artisan APIs

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/artisans` | List artisans |
| `POST` | `/api/artisans` | Create artisan |
| `GET` | `/api/artisans/:id` | Get single artisan |
| `PUT` | `/api/artisans/:id` | Update artisan (partial) |
| `DELETE` | `/api/artisans/:id` | Delete artisan (cascades to products) |

**Create Artisan — Required fields:** `name`, `phone`

**Create Artisan — Optional fields:** `preferred_language`, `location`

---

## 🤖 AI & External Integrations

The following endpoints are **reserved for future implementation**. They currently return controlled responses indicating their pending status.

| Endpoint | Purpose | Current Status |
| --- | --- | --- |
| `POST /api/products/:id/transcribe` | BHASHINI speech-to-text | Pending |
| `POST /api/products/:id/generate-catalog` | Gemini/LLM catalog generation | Pending |
| `POST /api/products/:id/pricing` | AI pricing intelligence | Pending |
| `POST /api/products/:id/enhance` | AI image enhancement | Pending |

**Current behavior:**

* **transcribe** — Returns sample transcript with message: `"Transcription pending BHASHINI integration"`
* **generate-catalog** — Returns placeholder catalog with message: `"Catalog generation pending AI integration"`
* **pricing** — Returns `{ "message": "Pricing intelligence pending AI integration", "status": "pending_ai" }`
* **enhance** — Returns original image URL unchanged with `{ "message": "AI enhancement pending integration", "status": "pending_ai" }`

**Future implementation:**
* BHASHINI → Government-backed Indian-language speech-to-text and translation
* Gemini/LLM → Structuring unstructured voice into standardized catalog entities
* AI Image Enhancement → Background isolation, clutter removal, studio lighting normalization
* AI Pricing Intelligence → ML models utilizing historical regional handicraft sales data

---

## ✅ Validation Rules

### Product Validation

| Rule | Error Message |
| --- | --- |
| Name required (create) | `"Product name is required"` |
| Name ≤ 255 chars | `"Product name must be 255 characters or less"` |
| Category/Material/Colour/Craft type length limits | Field-specific messages |
| Final price must be non-negative number | `"Final price must be a valid non-negative number"` |
| Status must be draft/published/archived | `"Status must be one of: draft, published, archived"` |
| Keywords must be array of strings | `"Keywords must be an array of strings"` |
| artisan_id must be valid UUID | `"artisan_id must be a valid UUID"` |

### Artisan Validation

| Rule | Error Message |
| --- | --- |
| Name required (create) | `"Artisan name is required"` |
| Phone required (create) | `"Phone number is required"` |
| Phone ≤ 20 chars | `"Phone must be 20 characters or less"` |
| Duplicate phone | HTTP `409` — `"An artisan with this phone number already exists"` |

### File Upload Validation

| Rule | Error | Code |
| --- | --- | --- |
| No file | `"No image file provided..."` | 400 |
| Invalid file type | `"Invalid file type..."` | 400 |
| File > 10 MB | `"File too large. Maximum size is 10 MB."` | 413 |

---

## 🛡 Error Handling

| Code | Meaning | When Returned |
| --- | --- | --- |
| `200` | OK | Successful GET, PUT, DELETE, PATCH |
| `201` | Created | Successful POST |
| `400` | Bad Request | Invalid input, malformed request |
| `403` | Forbidden | Ownership mismatch |
| `404` | Not Found | Resource does not exist or unknown route |
| `413` | Payload Too Large | File exceeds 10 MB |
| `422` | Unprocessable Entity | Validation failed (field-level errors) |
| `500` | Internal Server Error | Unexpected error (details hidden in production) |
| `503` | Service Unavailable | Supabase not configured |

---

## 🔗 Frontend → Backend Integration

**Frontend API client:** `src/utils/api.js` | **Default URL:** `http://localhost:5000/api`

```
Frontend → fetch() → Express API → Controller → Service → Supabase
```

**Image upload flow:**
1. Frontend sends `multipart/form-data` (field: `image`) to `POST /api/upload`
2. Backend validates type/size, uploads to Supabase Storage
3. Backend returns `publicUrl`
4. Frontend uses URL for `image_url` / `original_image_url` in product record

---

## 🔒 Security

* Supabase credentials are **server-side only** (`server/.env`)
- Service-role key never exposed to frontend
- `.env` files are gitignored
- File type/size validation on uploads
- Input validation on all endpoints
- Error responses don't expose stack traces in production

**Authentication:** Not implemented. Uses demo artisan for development.

---

## 🧪 Testing & Verification

| Feature | Verification | Status |
| --- | --- | --- |
| Product CRUD | Real Supabase DB | PASS |
| Artisan CRUD | Real Supabase DB | PASS |
| Product listing (with artisan join) | Real Supabase DB | PASS |
| Image upload to Supabase Storage | Verified | PASS |
| Image URL persistence in DB | Verified | PASS |
| Frontend → Backend → Supabase E2E | Verified | PASS |
| Input validation | API tests | PASS |
| Error handling | API tests | PASS |
| AI integrations | Not implemented | PENDING |

---

## 📋 Development Rules

1. **Do NOT expose Supabase secrets** — server-side only
2. **Do NOT implement AI functionality** unless explicitly requested
3. **Preserve AI/integration stubs** in `aiController.js`
4. **Do not break API contracts** — `{ success, message, data }` format
5. **Do not rename endpoints** — frontend depends on specific URLs
6. **Do not change schema** without updating documentation
7. **Keep backend modular** — controller → service → repository
8. **Validate all incoming data**
9. **Keep frontend/backend responsibilities separated**

---

## ⚠ Known Limitations

### Pending AI Work
* BHASHINI speech-to-text
* Gemini/LLM catalog generation
* AI image enhancement
* AI pricing intelligence

### Backend Limitations
* No authentication (demo artisan)
* No rate limiting
* No API versioning
* No migration system

---

## 🏃 Quick Start

```bash
# 1. Install frontend deps
npm install

# 2. Install backend deps
cd server && npm install

# 3. Configure backend
cp .env.example .env  # Add Supabase credentials

# 4. Set up Supabase (run schema.sql in SQL Editor + create 'product-images' bucket)

# 5. Start backend
npm start  # → http://localhost:5000

# 6. Start frontend (new terminal)
cd .. && npm run dev  # → http://localhost:5173

# 7. Verify
curl http://localhost:5000/api/health
```

---

### Upload API

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/upload` | Upload product image to Supabase Storage |

**Request:** `multipart/form-data` with field name `image`

**Allowed types:** JPEG, PNG, WebP, GIF | **Max size:** 10 MB

**Success (201):**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "filePath": "products/1788516454948-tsgeiytn.png",
    "publicUrl": "https://your-project.supabase.co/storage/v1/object/public/product-images/products/..."
  }
}
```

**Errors:** `400` (invalid file type), `413` (file too large), `503` (storage not configured), `500` (bucket not found)

---

### Utility Endpoints

| Method | Endpoint | Description | Status |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Health check with DB status | Real |
| `POST` | `/api/calculate-price` | Heuristic price calculation | Real (heuristic) |
| `POST` | `/api/enhance-image` | Image enhancement | Mock |
| `POST` | `/api/process-voice` | Voice processing | Mock |
| `CORS_ORIGIN` | No | CORS origin (default: `*`) |

\* At least one key must be set. The service-role key is recommended for full functionality.

### Frontend (`.env` or `.env.local`)

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_URL` | No | Backend API URL (default: `http://localhost:5000/api`) |

**AI/Integration isolation:** Endpoints for BHASHINI, Gemini, AI image enhancement, and AI pricing are preserved as stubs in `aiController.js` and `aiRoutes.js`. They return controlled "pending" responses and are architecturally isolated from the working CRUD pipeline.

