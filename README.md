
# ShilpSaathi (शिल्पसाथी)

> **Your Craft. Your Story. Your Market.**  
> *AI-Powered Virtual Business Manager for Marginalized Artisans*

[![Theme](https://img.shields.io/badge/Theme-Heritage%20%26%20Culture-A44932?style=flat-square)](#)
[![Ministry](https://img.shields.io/badge/Ministry-Social%20Justice%20%26%20Empowerment-D4A72C?style=flat-square)](#)
[![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20PWA%20%7C%20PostgreSQL-3F7D58?style=flat-square)](#)

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
* **Step 2: AI Image Studio** — Background isolation, clutter removal, and studio lighting normalization.
* **Step 3: Voice Cataloging** — Hands-free Hindi tap-to-speak input powered by BHASHINI.
* **Step 4: AI Auto-Cataloger** — LLM-structured title, category, material, and bilingual descriptions.
* **Step 5: Hybrid Pricing Engine** — Transparent price range recommendation based on material cost and craft complexity.
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

## 🗄 Database Schema (PostgreSQL)

```sql
-- Artisan Identity
CREATE TABLE artisans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    preferred_language VARCHAR(50) DEFAULT 'hi',
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Catalog Items
CREATE TABLE products (
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
CREATE TABLE processing_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    operation VARCHAR(50) NOT NULL, -- 'image_enhance', 'voice_transcription', 'pricing'
    status VARCHAR(50) NOT NULL,    -- 'pending', 'completed', 'failed'
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

```

---

## 🚀 Getting Started

### Prerequisites

* Node.js (`v18.x` or `v20.x` recommended)
* npm (`v9.x` or higher)

### 1. Clone & Set Up Backend

```bash
# Navigate to server
cd server

# Install dependencies
npm install

# Start Express mock engine
node index.js
# Running on http://localhost:5000

```

### 2. Set Up Frontend PWA

```bash
# Navigate to client directory
cd ../client

# Install dependencies
npm install

# Start Vite dev server with network exposure
npm run dev -- --host
# Running on http://localhost:5173

```

### 3. Testing PWA on Mobile

1. Ensure your laptop and phone are on the same local network.
2. Open Chrome on Android or Safari on iOS and enter the `http://<laptop-ip>:5173` URL.
3. Tap **"Install ShilpSaathi"** or **"Add to Home Screen"** to run full-screen without address bars.

---

## 👥 Team Roles

| Member | Domain | Key Responsibilities |
| --- | --- | --- |
| **Harshit** | Frontend & PWA | React screen flows, PWA service worker, camera/mic bindings, API consumption |
| **Shakti** | Team Lead & Presentation | Pitch narrative, product vision, demo presentation, slides delivery |
| **Somesh** | Backend & Database | Express APIs, Supabase PostgreSQL, file storage schemas, data validation |
| **Shiva** | AI Integration | BHASHINI speech integration, LLM prompt engineering, background cleanup pipeline |
| **Piyush** | QA & Content | Demo catalog sample data, Hindi/English terminology checks, test scenarios |

---

## 🗺 Roadmap

* [x] **Phase 1 (MVP Sprint):** 9-screen linear PWA, camera integration, voice-to-bilingual catalog, heuristic pricing, shareable card.
* [ ] **Phase 2:** Direct GeM (Government e-Marketplace) and ONDC (Open Network for Digital Commerce) API adapters for 1-click publishing.
* [ ] **Phase 3:** Integration of trained ML pricing models utilizing historical regional handicraft sales data.
* [ ] **Phase 4:** B2B direct artisan-to-exporter bulk discovery dashboard with logistics handoff.

