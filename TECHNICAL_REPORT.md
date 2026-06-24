# ComplianceIQ — Technical Report

**Project:** FCC Compliance Readiness Assessment Platform  
**Version:** 1.0  
**Framework:** Next.js 14.2.5 (App Router)  
**Deployment:** Vercel  

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Project Structure](#3-project-structure)
4. [Pages & Routes](#4-pages--routes)
5. [Components](#5-components)
6. [Survey Logic & Scoring](#6-survey-logic--scoring)
7. [AI Integration](#7-ai-integration)
8. [Storage Strategy](#8-storage-strategy)
9. [Admin Panel](#9-admin-panel)
10. [Authentication](#10-authentication)
11. [PDF Generation](#11-pdf-generation)
12. [Environment Variables](#12-environment-variables)
13. [Design System](#13-design-system)
14. [Dependencies](#14-dependencies)
15. [Deployment Guide](#15-deployment-guide)

---

## 1. Project Overview

ComplianceIQ is a web-based FCC Compliance Readiness Assessment tool. Organizations complete an 8-question survey about their compliance posture, receive an instant 80-point score, and download a professionally formatted PDF report with AI-generated analysis tailored to their industry.

**Key capabilities:**

| Capability | Detail |
|---|---|
| Survey completion | ~3 minutes, 8 questions |
| Scoring | 80-point framework, 3 risk tiers |
| AI analysis | Gemini 2.0 Flash — strengths, weaknesses, recommendations |
| Report output | 4-page PDF (cover, summary, findings, audit trail) |
| Audit logging | Every submission persisted with full metadata |
| Admin panel | Password-protected dashboard showing all submissions |

---

## 2. Architecture

```
Browser
  │
  ├── GET /              → Next.js Server Component (static)
  ├── GET /admin         → Next.js Server Component (dynamic, auth-gated)
  ├── GET /admin/login   → Next.js Client Component
  │
  ├── POST /api/submit          → Score survey → call Gemini → write audit log
  ├── POST /api/admin/login     → Validate password → set HTTP-only cookie
  └── POST /api/admin/logout    → Delete cookie
         │
         ├── Local dev  → audit-log.json  (filesystem)
         └── Production → Vercel Blob     (cloud)
```

**Rendering strategy:**

| Route | Strategy | Reason |
|---|---|---|
| `/` | Static | Marketing content never changes |
| `/admin` | Dynamic (`force-dynamic`) | Must show latest submissions on every visit |
| `/admin/login` | Client component | Form state required |
| `/api/*` | Serverless functions | On-demand, runtime logic |

**Middleware** intercepts every `/admin/*` request (except `/admin/login`) and redirects unauthenticated users to the login page before any page renders.

---

## 3. Project Structure

```
servey/
├── app/
│   ├── layout.tsx                    # Root layout — Inter font, global metadata
│   ├── page.tsx                      # Home page — assembles all marketing sections
│   ├── globals.css                   # Base styles, scroll-reveal animations, hero grid
│   ├── admin/
│   │   ├── page.tsx                  # Admin dashboard (server component)
│   │   ├── AdminTable.tsx            # Expandable submissions table (client component)
│   │   ├── LogoutButton.tsx          # Logout button (client component)
│   │   └── login/
│   │       └── page.tsx              # Admin login form (client component)
│   └── api/
│       ├── submit/
│       │   └── route.ts              # Survey submission handler
│       └── admin/
│           ├── login/route.ts        # Admin authentication
│           └── logout/route.ts       # Session termination
├── components/
│   ├── Navbar.tsx
│   ├── Hero.tsx
│   ├── ScoreCard.tsx
│   ├── TrustBar.tsx
│   ├── HowItWorks.tsx
│   ├── Industries.tsx
│   ├── Features.tsx
│   ├── CTASection.tsx
│   ├── SurveySection.tsx
│   ├── Survey.tsx                    # Main interactive form + results
│   ├── Footer.tsx
│   └── ScrollReveal.tsx              # Intersection Observer fade-in
├── lib/
│   └── generatePDF.ts                # jsPDF 4-page report builder
├── middleware.ts                     # Admin route guard
├── tailwind.config.ts
├── package.json
├── .env.local                        # Local secrets (gitignored)
└── audit-log.json                    # Local dev audit store
```

---

## 4. Pages & Routes

### Pages

#### `GET /`
Static landing page. Renders marketing sections in order: `Navbar` → `Hero` → `TrustBar` → `HowItWorks` → `Industries` → `Features` → `SurveySection` → `CTASection` → `Footer`. All scroll-reveal animations are triggered by `ScrollReveal` via Intersection Observer.

#### `GET /admin`
Password-gated admin dashboard. Rendered dynamically on every request. Reads the full audit log (Blob or local file), computes aggregate stats (total, average score, risk breakdown), and passes data down to `AdminTable`.

#### `GET /admin/login`
Login form. POSTs credentials to `/api/admin/login`. On success, cookie is set and user is redirected to `/admin`. On failure, displays inline error.

### API Routes

#### `POST /api/submit`

**Input:**
```json
{
  "companyName": "string",
  "contactName": "string",
  "email": "string",
  "industry": "string",
  "answers": ["yes", "no", "partially", ...]  // 8 items
}
```

**Processing steps:**
1. Validate required fields and `answers.length === 8`
2. Calculate score using `SCORE_MAP`
3. Determine risk tier via `getRisk(score)`
4. Call Gemini 2.0 Flash for AI analysis (falls back to `buildFallback()` on error)
5. Build audit record with full metadata
6. Persist to Blob or local file (non-fatal — failure does not block response)
7. Return score, risk, analysis, and audit record

**Output:**
```json
{
  "success": true,
  "score": 60,
  "maxScore": 80,
  "riskLevel": "Moderate Risk",
  "riskBadge": "moderate",
  "riskColor": "#F59E0B",
  "analysis": {
    "strengths": ["..."],
    "weaknesses": ["..."],
    "recommendations": ["..."]
  },
  "auditRecord": { ... }
}
```

#### `POST /api/admin/login`

Compares POSTed `password` against `process.env.ADMIN_PASSWORD`. On match, sets `admin_auth` cookie (httpOnly, 24h, secure in production) and returns `{ success: true }`. On mismatch, returns `401`.

#### `POST /api/admin/logout`

Deletes the `admin_auth` cookie and returns `{ success: true }`.

---

## 5. Components

| Component | Type | Purpose |
|---|---|---|
| `Navbar` | Client | Fixed header; becomes opaque on scroll. Logo, nav links, "Start Assessment" CTA. |
| `Hero` | Server | Above-the-fold section. Gradient headline, proof points, two CTAs, animated score card. |
| `ScoreCard` | Server | Visual mockup of a 72/80 score result with risk badge and sample findings. |
| `TrustBar` | Server | Four stat chips: 500+ assessments, <3 min, 8 domains, 80-point scale. |
| `HowItWorks` | Server | Numbered 3-step process: Complete → Receive Score → Download Report. |
| `Industries` | Server | Grid of 6 industry cards with FCC-specific context for each sector. |
| `Features` | Server | 6-feature grid: scoring framework, AI analysis, PDF report, audit trail, risk tiers, speed. |
| `CTASection` | Server | Blue gradient section with a single call-to-action linking to the survey. |
| `SurveySection` | Server | Thin wrapper that anchors the survey with `id="assessment"`. |
| `Survey` | Client | Main interactive form. Manages all form state, submission, loading, results display, and PDF download trigger. |
| `Footer` | Server | Dark footer with logo, navigation links, and copyright. |
| `ScrollReveal` | Client | Attaches `IntersectionObserver` to all `[data-reveal]` elements for fade-in-up animations. |
| `AdminTable` | Client | Sortable, expandable table of submissions. Click any row to see per-question scores. |
| `LogoutButton` | Client | Calls `/api/admin/logout` then navigates to `/admin/login`. |

---

## 6. Survey Logic & Scoring

### Questions

| # | Question |
|---|---|
| 1 | Does your organization maintain written compliance procedures? |
| 2 | Do you track FCC filing deadlines? |
| 3 | Are compliance responsibilities assigned to specific personnel? |
| 4 | Have you conducted an FCC compliance review within the last 12 months? |
| 5 | Are compliance documents stored in a centralized system? |
| 6 | Can you produce documentation during an audit within 48 hours? |
| 7 | Are compliance-related communications documented? |
| 8 | Do you have a process for tracking corrective actions? |

### Score Map

```typescript
const SCORE_MAP: Record<string, number> = {
  yes:       10,
  partially:  5,
  somewhat:   5,
  sometimes:  5,
  unsure:     5,
  no:         0,
}
```

Maximum score: **80 points** (8 questions × 10 points each).

### Risk Tiers

```typescript
function getRisk(score: number) {
  if (score >= 65) return { level: 'Low Risk',      color: '#10B981' }
  if (score >= 40) return { level: 'Moderate Risk', color: '#F59E0B' }
  return               { level: 'High Risk',        color: '#EF4444' }
}
```

| Risk Level | Score Range | Color |
|---|---|---|
| Low Risk | 65 – 80 | Emerald `#10B981` |
| Moderate Risk | 40 – 64 | Amber `#F59E0B` |
| High Risk | 0 – 39 | Red `#EF4444` |

---

## 7. AI Integration

**Provider:** Google Generative AI  
**Model:** `gemini-2.0-flash`  
**SDK:** `@google/generative-ai`  
**Trigger:** Every survey submission when `GEMINI_API_KEY` is set

### Prompt

The model is sent a single user message containing:
- Company name, industry, score, and risk level
- All 8 questions with the submitted answer and points
- Instruction to return only a strict JSON object (no markdown fences)

**Expected JSON shape:**
```json
{
  "strengths":       ["...", "..."],
  "weaknesses":      ["...", "..."],
  "recommendations": ["...", "...", "..."]
}
```

**Guidelines injected into prompt:**
- Strengths (2–3): tied to "Yes" answers; FCC-specific for the given industry
- Weaknesses (2–3): tied to "No" or partial answers; compliance gap framing
- Recommendations (3): actionable, prioritized, 1–2 sentences each

### Fallback (`buildFallback`)

Called when `GEMINI_API_KEY` is absent or the API call throws. Generates rule-based output:
- **Strengths** — one entry per "Yes" answer (max 3), formatted as confirmation statements
- **Weaknesses** — one entry per low-score answer (max 3), formatted as gap statements
- **Recommendations** — 3 static best-practice statements covering procedures, document storage, and periodic reviews

AI errors are logged to the console but are non-fatal — the submission completes with fallback analysis.

---

## 8. Storage Strategy

The app uses a dual-mode storage strategy controlled by the presence of `BLOB_READ_WRITE_TOKEN`.

```typescript
const useBlob = () => !!process.env.BLOB_READ_WRITE_TOKEN
```

| Environment | Storage | Notes |
|---|---|---|
| Local development | `audit-log.json` on disk | Committed to repo for seeded data |
| Vercel production | Vercel Blob (`audit-log.json`) | Persistent, survives redeployments |

### Read

```
useBlob() true  → list blobs with prefix "audit-log.json" → fetch downloadUrl → parse JSON
useBlob() false → fs.readFile(LOCAL_LOG) → parse JSON
Either path → returns [] on any error (file not found, network, etc.)
```

### Write

```
useBlob() true  → put("audit-log.json", JSON, { access: 'public', allowOverwrite: true })
useBlob() false → fs.writeFile(LOCAL_LOG, JSON)
```

The write call is wrapped in its own `try/catch` — a storage failure logs a warning but does not cause the submit endpoint to return a 500.

### Audit Record Schema

```typescript
{
  id:             string    // Date.now() as string
  surveyVersion:  string    // "1.0"
  submissionDate: string    // ISO 8601 timestamp
  scoreGenerated: string    // Human-readable localized timestamp
  companyName:    string
  contactName:    string
  user:           string    // Email address
  industry:       string
  responses: {
    question: string
    answer:   string
    points:   number        // 0, 5, or 10
  }[]
  score:    number          // 0–80
  maxScore: number          // 80
  riskLevel: string         // "Low Risk" | "Moderate Risk" | "High Risk"
}
```

---

## 9. Admin Panel

### Dashboard (`/admin`)

**Stats row (4 cards):**

| Card | Value |
|---|---|
| Total Submissions | Count of all records |
| Average Score | Mean score across all submissions / 80 |
| Low / Moderate | Count split of non-high-risk submissions |
| High Risk | Count of submissions scoring < 40 |

**Submissions table:**

| Column | Content |
|---|---|
| Company | Company name + email (subdued) |
| Contact | Contact person name |
| Industry | Industry type |
| Score | Progress bar + numeric `score/80` |
| Risk | Color-coded badge (Emerald / Amber / Red) |
| Submitted | Short date (e.g., Jun 19, 2026) |
| Toggle | Chevron to expand/collapse row |

**Expanded row** shows all 8 Q&A pairs with per-question point values (green 10, amber 5, red 0), plus submission ID, survey version, and generation timestamp.

Records are displayed newest-first (array reversed before render).

---

## 10. Authentication

### Middleware (`middleware.ts`)

Runs on every request matching `/admin/:path*` before the page renders.

```
Request to /admin/*
  ├── path is /admin/login → pass through
  └── else
        ├── read cookie "admin_auth"
        ├── compare value to ADMIN_PASSWORD env var
        ├── match  → NextResponse.next()
        └── no match → redirect to /admin/login
```

### Cookie Properties

| Property | Value | Purpose |
|---|---|---|
| `httpOnly` | `true` | Inaccessible to client-side JavaScript |
| `secure` | `true` in production | HTTPS only |
| `sameSite` | `'lax'` | CSRF mitigation |
| `maxAge` | `86400` (24h) | Automatic expiry |
| `path` | `'/'` | Valid site-wide |

### Login Flow

1. User submits password on `/admin/login`
2. Client POSTs `{ password }` to `/api/admin/login`
3. Server compares to `ADMIN_PASSWORD` env var (exact string match)
4. Match → set `admin_auth` cookie → client navigates to `/admin`
5. No match → `401` response → client shows "Incorrect password"

### Logout Flow

1. User clicks Logout button
2. Client POSTs to `/api/admin/logout`
3. Server deletes `admin_auth` cookie
4. Client navigates to `/admin/login`

---

## 11. PDF Generation

**Library:** jsPDF (`^2.5.1`)  
**File:** `lib/generatePDF.ts`  
**Output filename:** `ComplianceIQ_[CompanyName]_[Year].pdf`

### Report Structure (4 pages)

**Page 1 — Cover**
- Navy background with blue left stripe
- ComplianceIQ logo and assessment title
- Company name and submission date
- Large score display (e.g., "72") with risk color
- Compliance percentage
- Company details: contact name, email, industry, survey version

**Page 2 — Executive Summary**
- Score box and Risk Level box side by side
- Score distribution bar across three tiers
- Risk tier legend with score ranges
- AI-generated strengths, weaknesses, and recommendations in bulleted format

**Page 3 — Detailed Findings**
- Table of all 8 questions with answer and point value
- Color-coded points (green for 10, amber for 5, red for 0)
- Total row with final score and risk color

**Page 4 — Audit Record**
- Metadata table: submission date, company, contact, email, industry, version, score, risk
- Legal disclaimer: self-reported, informational only, not legal advice

### Color Reference (RGB)

| Name | RGB |
|---|---|
| Navy | (11, 22, 40) |
| Blue | (26, 86, 219) |
| Emerald (Low) | (16, 185, 129) |
| Amber (Moderate) | (245, 158, 11) |
| Red (High) | (239, 68, 68) |
| Muted text | (100, 116, 139) |

---

## 12. Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ADMIN_PASSWORD` | Yes | Plain-text password for admin panel access |
| `GEMINI_API_KEY` | No | Google AI API key. If absent, rule-based fallback is used |
| `BLOB_READ_WRITE_TOKEN` | No | Vercel Blob token. If absent, local `audit-log.json` is used |
| `NODE_ENV` | Auto-set | Controls cookie `secure` flag (`true` in production) |

All secrets must be defined in `.env.local` for local development and in **Vercel → Settings → Environment Variables** for production. `.env.local` is gitignored and must never be committed.

---

## 13. Design System

### Brand Color Tokens

| Token | Hex | Usage |
|---|---|---|
| `brand-navy` | `#0B1628` | Page backgrounds, hero, admin |
| `brand-navy-mid` | `#152238` | Cards, table backgrounds, overlays |
| `brand-blue` | `#1A56DB` | Primary buttons, links |
| `brand-blue-lt` | `#3F7AEB` | Light accents, gradient stops |
| `brand-sky` | `#EBF2FF` | Light section backgrounds |

### Risk Color Classes

| Risk | Background | Text | Border |
|---|---|---|---|
| Low Risk | `bg-emerald-500/15` | `text-emerald-400` | `border-emerald-500/25` |
| Moderate Risk | `bg-amber-500/15` | `text-amber-400` | `border-amber-500/25` |
| High Risk | `bg-red-500/15` | `text-red-400` | `border-red-500/25` |

### Typography

- **Font:** Inter (Google Fonts, variable font via `next/font`)
- **Headings:** `text-white font-bold tracking-tight`
- **Body / muted:** `text-slate-400`
- **Labels / caps:** `text-xs font-semibold uppercase tracking-wider`

### Animation

- **Scroll reveal:** `[data-reveal]` elements fade in (opacity 0→1, translateY 24px→0) when entering the viewport via `IntersectionObserver`
- **Delay variants:** `data-reveal-delay="100|200|300|400|500"` for staggered grid animations
- **Float:** `.float` keyframe animation (0→-8px→0 over 5s) used on the hero score card

---

## 14. Dependencies

### Production

| Package | Version | Purpose |
|---|---|---|
| `next` | 14.2.5 | Framework — App Router, server components, API routes, middleware |
| `react` | ^18 | UI library |
| `react-dom` | ^18 | DOM rendering |
| `@google/generative-ai` | latest | Google Gemini AI SDK |
| `@vercel/blob` | ^2.4.1 | Cloud blob storage for audit log persistence |
| `jspdf` | ^2.5.1 | Client-side PDF generation |
| `lucide-react` | ^0.417.0 | SVG icon components |

### Development

| Package | Version | Purpose |
|---|---|---|
| `typescript` | ^5 | Type checking |
| `tailwindcss` | ^3.4.1 | Utility CSS framework |
| `postcss` | ^8 | CSS processing |
| `autoprefixer` | ^10.0.1 | Vendor prefix injection |
| `eslint` | ^8 | Linting |
| `eslint-config-next` | 14.2.5 | Next.js lint rules |
| `@types/node` | ^20 | Node.js type definitions |
| `@types/react` | ^18 | React type definitions |
| `@types/react-dom` | ^18 | React DOM type definitions |

---

## 15. Deployment Guide

### Prerequisites

- Node.js 18+
- Vercel account with the project connected to this repository
- Google AI Studio API key (`GEMINI_API_KEY`)

### Local Development

```bash
npm install
# Create .env.local with:
# GEMINI_API_KEY=...
# ADMIN_PASSWORD=...
npm run dev
```

Survey submissions are saved to `audit-log.json` in the project root. Admin panel is available at `http://localhost:3000/admin`.

### Production (Vercel)

**Step 1 — Enable Blob Storage**

Vercel Dashboard → your project → **Storage** → **Create Database** → **Blob** → Connect to project.

This automatically injects `BLOB_READ_WRITE_TOKEN` into your environment.

**Step 2 — Add Environment Variables**

Vercel Dashboard → your project → **Settings** → **Environment Variables**:

| Key | Value |
|---|---|
| `GEMINI_API_KEY` | Your Google AI API key |
| `ADMIN_PASSWORD` | Your chosen admin password |

**Step 3 — Deploy**

Push to the connected branch. Vercel builds and deploys automatically.

```bash
git add .
git commit -m "deploy"
git push
```

**Step 4 — Verify**

- Submit a test survey at your Vercel URL
- Visit `[your-url]/admin`, log in, and confirm the submission appears

### Build Commands

| Command | Action |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Start production server locally |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Type check without emitting files |

---

*Generated: June 2026 — ComplianceIQ v1.0*
