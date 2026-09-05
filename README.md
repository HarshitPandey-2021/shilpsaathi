# ShilpSaathi

> Your Craft. Your Story. Your Market.

ShilpSaathi is a mobile-first Progressive Web App designed to reduce the
digital-commerce barrier faced by marginalized artisans and micro-entrepreneurs.
The intended experience helps an artisan create a product listing without needing
to become a professional photographer, copywriter, translator, or digital marketer.

This repository contains a working MVP flow, a Node.js API, Supabase data and
storage integration, and a separate Python image-processing service. Some features
remain partial or are represented by frontend-only behavior.

## Overview

The application combines photo capture, image enhancement, voice input, structured
catalog extraction, bilingual content, pricing assistance, review, publishing, and
sharing in one guided flow. It is currently strongest for a single product creation
session. Authentication, artisan accounts, and a complete marketplace are not
implemented.

## Core User Journey

```text
Open ShilpSaathi -> Create product -> Take/upload photo -> AI image enhancement
-> Voice or text description -> Speech-to-text and catalog extraction
-> Hindi and English content -> Pricing recommendation -> Review/edit
-> Publish product record -> Share text through device share or clipboard
```

| Journey step | Status | Notes |
| --- | --- | --- |
| Product creation flow | Implemented | Guided React screens hold one product in client state. |
| Photo capture/upload | Implemented, configuration-dependent | Browser selection is supported; backend upload needs Supabase Storage. |
| AI image enhancement | Implemented | Streaming upload calls the Python FastAPI service; the frontend can fall back to its local preview after failure. |
| Voice description | Implemented, partial | Browser SpeechRecognition and WAV recording depend on browser support and permissions. |
| Speech-to-text | Partial | Bhashini ASR is attempted for recorded audio; browser recognition or text input can provide a fallback. |
| Multilingual processing | Partial | UI/speech choices include Hindi, English, Bengali, Tamil, Telugu, and Marathi. Structured output is Hindi/English and extraction is primarily Hindi/English heuristic logic. |
| Catalog generation | Implemented, partial | Heuristic extraction is always used; Gemini is optional and normalized by the heuristic layer. |
| Pricing recommendation | Implemented | Node pricing service calculates cost, labor, overhead, margin, and a suggested range. |
| Review and edit | Partial | Catalog fields can be edited before pricing; the final review screen is read-only. |
| Final digital listing | Implemented, configuration-dependent | Publish creates a Supabase product record when the database is configured. |
| Share/publish | Partial | Native Web Share or clipboard text is available; there is no WhatsApp-specific integration or public listing card/link. |

## Features

| Feature | Status | Description |
| --- | --- | --- |
| Product capture and upload | Implemented | Select an image and send it to the upload API. |
| AI image studio | Implemented | Background removal, lighting correction, conditional enlargement, and a 1080x1080 output canvas. |
| Voice input | Partial | Browser speech recognition, microphone recording, transcript fallback, and language selection. |
| Bhashini speech processing | Partial | Server transcription is integrated when configured and reachable. |
| Hindi and English catalog content | Implemented | Extraction returns Hindi and English descriptions. |
| General multilingual catalog generation | Planned | UI language support is broader than the structured extraction/output model. |
| Catalog editing | Implemented | Title, category, material, colour, and descriptions can be edited; keywords are displayed only. |
| Pricing assistant | Implemented | Heuristic calculation uses material cost, labor hours, skill level, overhead, margin, and category metadata. |
| Product CRUD API | Implemented | Product create, read, update, delete, listing, and status routes exist. |
| Artisan CRUD API | Implemented | Artisan create, read, update, and delete routes exist. |
| Product image storage | Implemented, configuration-dependent | Enhanced files are uploaded to the configured Supabase bucket. |
| Authentication and authorization | Planned | No login, session, or enforced ownership model is implemented. |
| Offline mode | Planned | PWA tooling exists, but no verified offline product workflow or local persistence exists. |

## Current Implementation

### Frontend

The Vite/React client contains onboarding, language selection, a home dashboard,
photo capture, image studio preview, voice input, catalog editing, pricing, review,
and final listing screens. The dashboard displays static demonstration metrics; it
does not fetch persisted products. Product data stays in `CraftContext` until the
final publish action, and the initial context contains demonstration values.

The final screen creates a product through the API, then uses the browser Web Share
API or clipboard. It does not open WhatsApp or create a public listing URL/card.

### Backend and AI

The Express server provides JSON APIs, multipart upload handling, validation, CORS,
response helpers, Supabase access, and local startup of the Python AI service.

`ai-service/processor.py` performs: resize to a maximum working edge of 1600;
quality analysis; `rembg` background removal with the `bria-rmbg` session; alpha
refinement and crop; product quality analysis; conditional skip/Lanczos/Real-ESRGAN
enlargement; lighting correction; and composition on a white 1080x1080 canvas.
The active pipeline does not use YOLO segmentation. The BRIA RMBG 2.0 weights are
fetched by `rembg`; see `ai-service/AI-MODELS.md` for the license warning.

The browser can provide a live transcript through Web Speech API. A 16 kHz WAV
recording can be sent to the server. `voiceService.js` tries Bhashini ASR, optionally
calls Gemini, and applies Hindi/English fact extraction for product fields, price,
colour, material, category, keywords, and descriptions. This is not a general
translation or LLM catalog system.

`pricingService.js` calculates raw material cost, labor cost, 12% overhead, 25%
artisan margin, and a suggested price range. The frontend calls it as inputs change
and has a local fallback if the API is unavailable.

## Tech Stack

- **Frontend:** React 19, Vite 8, Tailwind CSS 3, `vite-plugin-pwa`, `lucide-react`.
- **Backend:** Node.js 20 target, Express 5, Supabase JS SDK, Multer, CORS, dotenv.
- **Image service:** Python 3.10+, FastAPI, Uvicorn, Pillow, NumPy, OpenCV, `rembg==2.0.83`, ONNX Runtime, Real-ESRGAN 0.3.0, and PyTorch.
- **Data/storage:** PostgreSQL and Storage through Supabase.
- **Optional integrations:** Bhashini ULCA/Dhruva ASR, Google Gemini, and browser Web Speech API.

## Architecture

```text
Artisan -> React PWA -> Node.js / Express API
                              | \
                              |  -> Python FastAPI AI service
                              v
                    Supabase PostgreSQL + Storage
```

The frontend owns the guided workflow and local state. The backend owns routing,
validation, pricing, voice orchestration, CRUD, and storage uploads. The Python
service owns background removal and image processing. Supabase stores products,
artisans, and uploaded images.

## Project Structure

```text
shilpsaathi/
├── src/                    # React app, screens, context, components, utilities
├── server/                 # Express app, routes, controllers, services, schema
├── ai-service/             # FastAPI image service and model pipeline
│   ├── main.py
│   ├── processor.py
│   ├── background_remover.py
│   ├── upscaler.py
│   ├── quality.py
│   ├── benchmark_pipeline.py
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── AI-MODELS.md
│   └── weights/RealESRGAN_x4plus.pth
├── public/
├── Dockerfile.client
├── docker-compose.yml
├── vite.config.js
├── tailwind.config.js
├── package.json
├── .env.example
└── PROJECT_TODO.md
```

## Database Schema

`server/src/db/schema.sql` defines:

- **`artisans`:** `id`, `name`, unique `phone`, `preferred_language`, `location`, `created_at`.
- **`products`:** artisan relation, name/category/material/colour/craft type, Hindi and English descriptions, keywords, original/enhanced image URLs, prices, status, and `created_at`.
- **`processing_logs`:** operation status and timestamps related to a product. The table exists, but the inspected services do not currently write rows.

The schema inserts a demo artisan for development. RLS statements are commented out,
and there is no authentication-backed artisan identity.

## API

Default base URL: `http://localhost:5000/api`. Most endpoints use response helpers;
`/api/health` has its own health response shape.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | API status and Supabase configuration status. |
| GET/POST | `/api/products` | List or create products; list accepts optional `artisan_id`. |
| GET/PUT/DELETE | `/api/products/:id` | Retrieve, update, or delete a product. |
| GET | `/api/products/:id/listing` | Product with artisan details. |
| PATCH | `/api/products/:id/status` | Set `draft`, `published`, or `archived`. |
| GET/POST | `/api/artisans` | List or create artisans. |
| GET/PUT/DELETE | `/api/artisans/:id` | Retrieve, update, or delete an artisan. |
| POST | `/api/upload` | Enhance and upload an image; multipart field `image`. |
| POST | `/api/upload/stream` | SSE enhancement progress and final upload. |
| POST | `/api/process-voice` | Audio/direct transcript to transcript, catalog, and pricing. |
| POST | `/api/calculate-price` | Fair-price recommendation. |
| POST | `/api/products/:id/transcribe` | Product-scoped Bhashini transcription. |
| POST | `/api/products/:id/generate-catalog` | Product-scoped heuristic catalog extraction. |
| POST | `/api/products/:id/pricing` | Product-scoped pricing calculation. |
| POST | `/api/enhance-image` | Legacy passthrough; does not run the Python enhancer. |
| POST | `/api/products/:id/enhance` | Legacy passthrough; does not run the Python enhancer. |

Images accept JPEG, PNG, WebP, and GIF with a 25 MB limit. The frontend primarily
uses `/api/upload/stream`.

## Environment Variables

Root `.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
```

Backend variables:

```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_STORAGE_BUCKET=product-images
CORS_ORIGIN=http://localhost:5173
AI_IMAGE_SERVICE_URL=http://localhost:8000
AI_ENHANCE_TIMEOUT=180000
BHASHINI_USER_ID=your-user-id
BHASHINI_API_KEY=your-api-key
BHASHINI_INFERENCE_API_KEY=your-inference-key
BHASHINI_PIPELINE_ID=your-pipeline-id
GEMINI_API_KEY=your-gemini-key
```

Bhashini and Gemini variables are optional for fallback operation. Keep service-role
and inference credentials server-side. The repository has no separate
`server/.env.example`.

## Local Setup

Prerequisites: Node.js 20+, npm, Python 3.10+, and a Supabase project with a
`product-images` bucket for persistence.

```bash
npm install
cd server && npm install && cd ..
cd ai-service
python -m venv venv
```

Activate the environment, then run `pip install -r requirements.txt`. Apply
`server/src/db/schema.sql` in Supabase and configure backend variables.

From the repository root:

```bash
npm run server:dev
npm run dev
```

The backend normally runs at `http://localhost:5000`, the AI service at
`http://localhost:8000`, and Vite at `http://localhost:5173`. The Node server tries
to start the local Python service automatically.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite. |
| `npm run server:dev` | Start Node with watch mode. |
| `npm run server` | Start Node. |
| `npm run build` | Build the frontend. |
| `npm run lint` | Run ESLint. |
| `npm run preview` | Preview the frontend build. |

There is no integrated automated test script in the root or server package.

## Docker

`docker-compose.yml` defines `client` on port 3000, `server` on port 5000, and
`ai-service` on port 8000. Run `docker compose up --build`. This is a local/container
configuration, not a claim that the native Python AI service is compatible with
Vercel Hobby serverless deployment.

## Security and Limitations

Present: in-memory uploads, image type/size validation, request validation,
configurable CORS, server-side Supabase access, and generic error handling.

Not present: authentication, authorization, enabled Supabase RLS, rate limiting,
API-key protection, verified offline persistence, checkout/orders, WhatsApp-specific
publishing, or complete multilingual catalog generation.

The frontend may continue with a local image preview when streaming enhancement or
storage fails. Production behavior should decide whether that fallback is acceptable
before treating the listing as publishable.

## Verification Status

The repository contains ad hoc Python checks including `test_rembg.py`,
`test_realesrgan.py`, and `benchmark_pipeline.py`. The root and server packages do
not define an automated test command. "Implemented" means the corresponding code
path exists; it does not imply a complete automated end-to-end verification suite.

## Roadmap

- Add authentication, artisan sessions, authorization, and Supabase RLS.
- Connect the dashboard to persisted product data.
- Add public listing URLs/cards and platform-specific sharing where required.
- Improve catalog extraction beyond Hindi/English heuristics.
- Add reliable offline persistence and retry behavior.
- Add automated API, frontend, and AI-service tests.
- Resolve commercial licensing and deployment constraints for the current image model.

## License

This project is developed for the Smart India Hackathon 2026. No separate
open-source license file is present. Review third-party dependency and model
licenses separately, especially `ai-service/AI-MODELS.md`, before commercial use.