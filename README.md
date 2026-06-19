# FCC Compliance Readiness Mini-Survey

> A single-file, zero-dependency web application for FCC compliance pre-screening.  
> Built for compliance consultants to embed on a landing page, collect client responses, score their compliance posture, generate an AI-powered readiness report, and produce a downloadable PDF — all from one HTML file with no server, no database, and no build step required.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Live Demo Flow](#2-live-demo-flow)
3. [Features](#3-features)
4. [Survey Structure](#4-survey-structure)
5. [Scoring System](#5-scoring-system)
6. [Risk Classification](#6-risk-classification)
7. [AI Analysis Engine](#7-ai-analysis-engine)
8. [PDF Report Structure](#8-pdf-report-structure)
9. [Audit Record](#9-audit-record)
10. [Setup & Deployment](#10-setup--deployment)
11. [Configuration](#11-configuration)
12. [Google Gemini API](#12-google-gemini-api)
13. [Fallback Engine](#13-fallback-engine)
14. [Design System](#14-design-system)
15. [Application Architecture](#15-application-architecture)
16. [Data Flow](#16-data-flow)
17. [Browser Support](#17-browser-support)
18. [Security Notes](#18-security-notes)
19. [Troubleshooting](#19-troubleshooting)
20. [File Structure](#20-file-structure)
21. [Technical Reference](#21-technical-reference)

---

## 1. Overview

The **FCC Compliance Readiness Mini-Survey** is a professional pre-screening tool used by FCC compliance consultants to quickly assess a prospective client's regulatory posture before beginning a formal engagement.

The survey collects four pieces of company identification information (Q1–Q4) and eight targeted compliance questions (Q5–Q12). Responses are scored on a 0–80 point scale. Google Gemini AI then analyzes the answers and produces a personalized compliance report with identified Strengths, Weaknesses, and prioritized Recommendations. The full report is available for download as a formatted PDF and a complete audit record is automatically saved to the browser.

The entire application lives in a single HTML file (`survey.html`) and has **no external dependencies** — no npm packages, no CDN links, no backend API, and no database. It can be opened directly in a browser or hosted on any static file server.

---

## 2. Live Demo Flow

The application walks users through five screens in sequence:

```
Welcome → Company Info → Compliance Questions → Processing (AI) → Results + PDF
```

| Screen | Description |
|--------|-------------|
| **Welcome** | Introduces the survey; shows stats (8 questions, 3–5 min, max 80 pts) |
| **Company Info** | Collects Q1–Q4: Company Name, Contact Name, Email, Industry |
| **Compliance Questions** | Q5–Q12: Eight scored compliance questions with radio button options |
| **Processing** | Animated screen while Gemini AI generates the analysis (2–3 seconds) |
| **Results** | Full report: Score gauge, Risk badge, AI analysis, Findings table, Audit record, PDF download button |

A sticky amber progress bar at the top of the page advances through each stage (0% → 22% → 55% → 82% → 100%).

---

## 3. Features

### Core Functionality
- **Multi-step survey** with animated transitions between views
- **Client-side validation** on all form fields with inline error messages
- **Real-time score calculation** with animated counter and gauge bar
- **AI-powered report** via Google Gemini 1.5 Flash
- **Silent fallback** to a built-in rule-based engine if AI is unavailable
- **PDF generation** via browser print — no external PDF library needed
- **Audit trail** persisted to localStorage after every submission
- **Start Over** button resets all state and returns to the welcome screen

### User Experience
- Smooth fade-up animation when switching between views
- Step indicator (Company Info → Assessment → Report) with completed checkmarks
- Scroll-to-error on question validation failure
- Score counter animates from 0 to the final value over 900ms with easing
- Gauge bar fills from 0% to the score percentage with a 1-second transition
- Processing screen shows rotating status messages while AI runs
- AI mode badge shows `· Live AI` or `· Built-in engine` so the user knows which path ran

### Accessibility
- All form inputs use `<label>` elements
- `prefers-reduced-motion` media query disables animations for users who need it
- Visible keyboard focus on all interactive elements
- `autocomplete` attributes on name and email fields

---

## 4. Survey Structure

### Section 01 — Company Identification (Q1–Q4)

These fields are not scored. They personalize the report and populate the audit record.

| Ref  | Field Label    | Input Type | Validation |
|------|---------------|------------|------------|
| Q–01 | Company Name  | Text input | Required; must not be blank |
| Q–02 | Contact Name  | Text input | Required; must not be blank |
| Q–03 | Email Address | Email input | Required; must match email format |
| Q–04 | Industry      | Dropdown select | Required; must select a value |

**Industry options:** Broadcaster, Manufacturer, Telecom Provider, Consultant, Law Firm, Other

---

### Section 02 — Compliance Assessment (Q5–Q12)

All eight questions are required. The user must select exactly one option per question before submitting. Attempting to submit with any unanswered question scrolls to the first unanswered question and highlights it in red.

| Ref  | Question | Answer Options | Max Points |
|------|----------|----------------|------------|
| Q–05 | Does your organization maintain written compliance procedures? | Yes / No / Partially | 10 |
| Q–06 | Do you track FCC filing deadlines? | Yes / No / Somewhat | 10 |
| Q–07 | Are compliance responsibilities assigned to specific personnel? | Yes / No / Partially | 10 |
| Q–08 | Have you conducted an FCC compliance review within the last 12 months? | Yes / No | 10 |
| Q–09 | Are compliance documents stored in a centralized system? | Yes / No / Partially | 10 |
| Q–10 | Can you produce documentation during an audit within 48 hours? | Yes / No / Unsure | 10 |
| Q–11 | Are compliance-related communications documented? | Yes / No / Sometimes | 10 |
| Q–12 | Do you have a process for tracking corrective actions? | Yes / No | 10 |

**Total possible score: 80 points**

---

## 5. Scoring System

Each answer maps to a point value. The total is the sum of all eight question scores.

| Answer | Points | Rationale |
|--------|--------|-----------|
| **Yes** | 10 | Full compliance demonstrated |
| **Partially** | 5 | Partial compliance; gaps exist |
| **Somewhat** | 5 | Partial compliance; inconsistent application |
| **Sometimes** | 5 | Compliance is inconsistent; not systematic |
| **Unsure** | 0 | Cannot confirm compliance; treated as non-compliant |
| **No** | 0 | No compliance demonstrated |

**Formula:**
```
Total Score = sum of SCORE[answer] for each of Q5–Q12
Maximum Score = 80 (8 questions × 10 points each)
```

**Score as percentage:**
```
Compliance % = (Total Score / 80) × 100
```

---

## 6. Risk Classification

The total score maps to one of four risk levels, each with a distinct color and description shown on the results screen and in the PDF report.

| Score Range | Risk Level | Color | Description |
|-------------|------------|-------|-------------|
| 70 – 80 | **Low Risk** | Green | Strong FCC compliance practices across most criteria |
| 50 – 69 | **Moderate Risk** | Amber | Reasonable foundation exists; identifiable gaps require prompt attention |
| 30 – 49 | **Elevated Risk** | Orange | Significant gaps present; remediation advised to reduce regulatory exposure |
| 0 – 29 | **High Risk** | Red | Critical deficiencies; immediate action required |

Each answer in the Detailed Findings table is also assigned a per-question risk level:

| Points Earned | Per-Question Risk |
|---------------|-------------------|
| 10 | Low |
| 5 | Moderate |
| 0 | High |

---

## 7. AI Analysis Engine

### Google Gemini (Primary)

After all questions are answered and the score is calculated, the application sends a structured prompt to the **Google Gemini 1.5 Flash** model via the Generative Language API.

The prompt includes:
- Company name and industry (for personalization)
- Total score and risk level
- All eight questions with the user's exact answer for each

Gemini is instructed to return a **raw JSON object** with three arrays:

```json
{
  "strengths": ["..."],
  "weaknesses": ["..."],
  "recommendations": ["..."]
}
```

**Prompt rules enforced:**
- One strength per `Yes` answer — specific to what that compliance area means for the user's industry
- One weakness per non-Yes answer — naming the specific FCC risk created
- One recommendation per weakness — actionable, referencing real FCC compliance practices, beginning with an action verb
- Professional consultant voice — specific and authoritative, not generic

**API configuration:**
- Model: `gemini-1.5-flash`
- Temperature: `0.4` (focused, consistent output)
- Response MIME type: `application/json` (forces clean JSON, no markdown wrapping)

### Fallback Engine (Automatic)

If Gemini fails for any reason (network error, invalid key, quota exceeded, malformed response), the application automatically switches to the built-in rule-based engine. No error is shown to the user.

See [Section 13](#13-fallback-engine) for details.

**AI mode indicator:**  
The results screen displays a small badge next to "Google Gemini":
- `· Live AI` — Gemini responded successfully
- `· Built-in engine` — fallback was used

---

## 8. PDF Report Structure

Clicking **Download PDF Report** opens a new browser tab with a fully formatted report and a print button. Users select **Print → Save as PDF** to download it.

The PDF is generated entirely in JavaScript using `window.open()` and injected HTML/CSS — no external PDF library required.

### Cover Page
| Field | Value |
|-------|-------|
| Report Title | "Compliance Readiness Report — Pre-Screening Assessment" |
| Survey Version | v1.0 |
| Company | Company name from Q–01 |
| Contact | Contact name from Q–02 |
| Industry | Industry from Q–04 |
| Date | Submission date in long format (e.g. June 19, 2026) |
| Compliance Score | `[score] / 80 — [Risk Level]` |

### Section 01 — Summary
- Numeric score displayed in large type with `/80` denominator
- Gauge bar filled to the score percentage
- Risk level tag (color-coded by classification)
- Risk description paragraph

### Section 02 — AI Analysis
- Source attribution (`✦ Analysis generated by Google Gemini AI` or built-in engine)
- **Strengths** — green left-border items
- **Weaknesses** — red left-border items
- **Recommendations** — blue left-border items, numbered

### Section 03 — Detailed Findings
A full table with one row per compliance question:

| Column | Content |
|--------|---------|
| Ref | Question reference (Q–05 through Q–12) |
| Question | Full question text |
| Response | The user's selected answer |
| Pts | Points earned for that answer |
| Risk | Per-question risk level (Low / Moderate / High) |

Footer row shows total score and overall risk level.

### Section 04 — Audit Record
A two-column table of all audit fields (see [Section 9](#9-audit-record)).

### Footer
Every page of the PDF shows: `Confidential — [Company Name]` / `FCC Compliance Readiness Survey v1.0` / `[Date]`

---

## 9. Audit Record

Every submission automatically saves a complete audit record to the browser's `localStorage` under the key `fcc-audit-log`. The record is also displayed on-screen in the Results view under **Section 05 — Audit Record**.

### Fields Captured

| Field | Source | Example |
|-------|--------|---------|
| **Submission Date** | `new Date()` at question submit time | `6/19/2026, 2:34:17 PM` |
| **User** | Contact name (Q–02) | `Jane Smith` |
| **Email** | Email address (Q–03) | `jane@acme.com` |
| **Company** | Company name (Q–01) | `Acme Broadcasting Inc.` |
| **Industry** | Industry dropdown (Q–04) | `Broadcaster` |
| **Survey Version** | Constant `VER` | `v1.0` |
| **Score Generated** | Calculated score | `60 / 80` |
| **Risk Level** | Risk classification label | `Moderate Risk` |

### localStorage Schema

Each submission appends one object to the array stored at `fcc-audit-log`:

```json
{
  "id": 1718800457123,
  "submittedAt": "2026-06-19T14:34:17.123Z",
  "company": {
    "name": "Acme Broadcasting Inc.",
    "contact": "Jane Smith",
    "email": "jane@acme.com",
    "industry": "Broadcaster"
  },
  "version": "1.0",
  "answers": {
    "q05": "Yes",
    "q06": "Partially",
    "q07": "Yes",
    "q08": "No",
    "q09": "Yes",
    "q10": "Unsure",
    "q11": "Sometimes",
    "q12": "Yes"
  },
  "score": 45,
  "riskLevel": "Elevated Risk"
}
```

### Reading Audit Records

Open DevTools (F12) → Console and run:

```javascript
// View all submissions
JSON.parse(localStorage.getItem('fcc-audit-log'))

// Count total submissions
JSON.parse(localStorage.getItem('fcc-audit-log')).length

// View the most recent submission
const log = JSON.parse(localStorage.getItem('fcc-audit-log'))
log[log.length - 1]

// Export as formatted JSON string
console.log(JSON.stringify(JSON.parse(localStorage.getItem('fcc-audit-log')), null, 2))
```

### Clearing Audit Records

```javascript
localStorage.removeItem('fcc-audit-log')
```

> **Note:** localStorage is browser-specific and device-specific. Records saved on Chrome are not visible in Firefox, and records saved on one device are not visible on another. For a shared, persistent audit log across devices, a database backend would be required.

---

## 10. Setup & Deployment

### Option A — Open Directly (Simplest)

No server needed. Double-click `survey.html` to open it in your default browser.

> **Limitation:** When opened as a `file://` URL, some browsers may block the Gemini API fetch call (CORS policy on `file://` origins). If this happens, the fallback engine will run instead. Host the file on a web server for full AI functionality.

---

### Option B — Static Web Host (Recommended)

Upload `survey.html` (and `README.md` if desired) to any static hosting provider:

| Provider | Instructions |
|----------|-------------|
| **GitHub Pages** | Push to a repo; enable Pages in Settings → Pages → Deploy from branch |
| **Netlify** | Drag-and-drop the file at netlify.com/drop |
| **Vercel** | `vercel --prod` in the directory |
| **cPanel / FTP** | Upload to `public_html/` via FTP or File Manager |
| **AWS S3** | Upload to an S3 bucket with static website hosting enabled |
| **Azure Static Web Apps** | Deploy via Azure Portal or GitHub Actions |

Once hosted, link to it from your landing page or embed it in an iframe.

---

### Option C — Embed in an Existing Page (iframe)

```html
<iframe
  src="https://yourdomain.com/survey.html"
  width="100%"
  height="950"
  frameborder="0"
  style="border:none;"
  title="FCC Compliance Readiness Survey">
</iframe>
```

Adjust `height` to fit your layout. The app is responsive and works at widths from 320px upward.

---

### Option D — Local Development Server

If you need to test with live AI (avoids the `file://` CORS restriction):

```bash
# Python 3
python -m http.server 8080

# Node.js
npx serve .

# PHP
php -S localhost:8080
```

Then visit `http://localhost:8080/survey.html`.

---

## 11. Configuration

All configurable values are defined as constants at the top of the `<script>` block in `survey.html`.

```javascript
const VER        = '1.0';                         // Survey version shown in header, PDF, and audit log
const GEMINI_KEY = 'YOUR_API_KEY_HERE';           // Google Gemini API key
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;

const SCORE = {
  Yes: 10,
  Partially: 5,
  Somewhat: 5,
  Sometimes: 5,
  Unsure: 0,
  No: 0
};
```

**To change the survey version:** Update `VER`. It will appear in the header, PDF cover page, PDF footer, and every audit record.

**To change the scoring weights:** Update values in the `SCORE` object. The maximum score will adjust automatically.

**To change the AI model:** Replace `gemini-1.5-flash` in `GEMINI_URL` with another Gemini model ID (e.g. `gemini-1.5-pro` for higher quality at greater cost).

---

## 12. Google Gemini API

### Getting an API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with a Google account
3. Click **Create API Key**
4. Copy the key and paste it into `survey.html` as the value of `GEMINI_KEY`

### Free Tier Limits (as of 2026)

| Metric | Limit |
|--------|-------|
| Requests per minute | 15 RPM |
| Requests per day | 1,500 RPD |
| Tokens per minute | 1,000,000 TPM |

For a typical survey deployment these limits are generous. A single survey submission uses approximately 800–1,200 tokens.

### Restricting the API Key (Security)

Because the API key is embedded in client-side JavaScript, anyone who views the page source can see it. To prevent unauthorized use:

1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services → Credentials**
3. Click your API key
4. Under **API restrictions**, restrict it to **Generative Language API** only
5. Under **Application restrictions**, select **HTTP referrers (websites)**
6. Add your domain: `https://yourdomain.com/*`
7. Save

This ensures the key only works when called from your specific domain.

### Testing the API

To manually verify the API key works, run this in your browser console:

```javascript
fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_KEY', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({contents:[{parts:[{text:'Say hello.'}]}]})
})
.then(r => r.json())
.then(d => console.log(d.candidates[0].content.parts[0].text))
.catch(e => console.error(e))
```

If you see a response, the key is valid. If you see an error object with `status: "PERMISSION_DENIED"` or `"API_KEY_INVALID"`, the key needs to be checked.

---

## 13. Fallback Engine

The built-in fallback engine runs automatically when Gemini is unavailable. It produces a rule-based analysis using pre-written expert findings for every possible answer to every question.

### How It Works

Each question in the `QS` array contains an `f` (findings) object. Each answer option maps to up to three findings:

```javascript
{
  id: 'q05',
  text: 'Does your organization maintain written compliance procedures?',
  opts: ['Yes', 'No', 'Partially'],
  f: {
    Yes:      { s: 'Formally documented written compliance procedures are in place.' },
    Partially:{ w: 'Written compliance procedures exist but are incomplete or inconsistently applied.',
                r: 'Expand and formalize your compliance procedures...' },
    No:       { w: 'No written compliance procedures have been established.',
                r: 'Develop comprehensive written compliance procedures...' }
  }
}
```

| Finding key | Meaning | Output section |
|-------------|---------|----------------|
| `s` | Strength | Strengths list |
| `w` | Weakness | Weaknesses list |
| `r` | Recommendation | Recommendations list |

The fallback engine loops through all eight questions, collects the matching findings for each answer, and returns them as the analysis. The result is deterministic: the same answers always produce the same findings.

### When the Fallback Triggers

- Gemini API key is missing or invalid
- API rate limit exceeded
- Network request fails (offline, CORS, timeout)
- Gemini returns an empty or unparseable response
- Any JavaScript error during the API call

The fallback is silent — the user sees the same results screen and the same PDF. Only the badge text and a console warning (`Gemini API unavailable, using built-in engine: [reason]`) distinguish it.

---

## 14. Design System

The application uses a CSS custom property design system defined in `:root`.

### Color Palette

| Variable | Hex | Usage |
|----------|-----|-------|
| `--ground` | `#F4F6FB` | Page background |
| `--surface` | `#FFFFFF` | Card backgrounds |
| `--navy` | `#0F2444` | Primary dark — header, buttons, instrument panel |
| `--navy-mid` | `#1A3A6B` | Secondary dark — hover states, table headers |
| `--amber` | `#B8821E` | Accent — progress bar, eyebrows, PDF highlights |
| `--blue` | `#2558A8` | Recommendations — links and action items |
| `--blue-light` | `#EBF2FF` | Recommendation badge background |
| `--text` | `#0D1B2E` | Body text |
| `--muted` | `#5A6A82` | Secondary text, labels, placeholders |
| `--border` | `#D0D8E8` | Default borders |
| `--border-strong` | `#A8B4CC` | Hover/active borders |

### Typography

| Variable | Stack | Usage |
|----------|-------|-------|
| `--sans` | `system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif` | All body and UI text |
| `--mono` | `'Cascadia Code', 'Consolas', 'SF Mono', 'Fira Code', ui-monospace, monospace` | All data, codes, refs, audit fields |

### Risk Colors (Results Screen — dark background)

| Level | Background | Text |
|-------|-----------|------|
| Low Risk | `rgba(26,102,68,.22)` | `#5DCFA0` |
| Moderate Risk | `rgba(138,96,16,.28)` | `#F5CC7A` |
| Elevated Risk | `rgba(160,64,32,.28)` | `#F5B090` |
| High Risk | `rgba(139,26,26,.32)` | `#F5A8A8` |

---

## 15. Application Architecture

The application is a single-page app with no framework. All state lives in one object `S`. Views are toggled with a CSS `.active` class.

### State Object (`S`)

```javascript
let S = {};

// After company form submit:
S.company = {
  name:     'Acme Broadcasting Inc.',
  contact:  'Jane Smith',
  email:    'jane@acme.com',
  industry: 'Broadcaster'
};

// After question submit:
S.answers     = { q05: 'Yes', q06: 'Partially', ... };
S.submittedAt = new Date();

// After processing:
S.score      = 45;
S.risk       = { label: 'Elevated Risk', cls: 'rl-elevated', desc: '...' };
S.analysis   = { str: [...], wk: [...], rc: [...] };
S.aiPowered  = true;  // or false if fallback ran
```

### View Management

```javascript
function go(view) {
  // Removes .active from all views, adds it to view-[view]
  // Updates progress bar width
  // Scrolls to top
}
```

Views: `welcome` → `company` → `questions` → `processing` → `results`

### Key Functions

| Function | Purpose |
|----------|---------|
| `go(view)` | Navigate to a view and update progress |
| `submitCompany()` | Validate Q1–Q4, save to S.company, advance |
| `buildQuestions()` | Render Q5–Q12 radio groups from the QS array |
| `submitQuestions()` | Validate all answers, save to S.answers, advance |
| `runProcessing()` | Async: calculate score, call Gemini, build results |
| `calcScore()` | Sum SCORE[answer] for all 8 questions |
| `riskProfile(score)` | Return risk label, CSS class, and description |
| `generateAIAnalysis()` | POST to Gemini API, parse JSON response |
| `generateFallbackAnalysis()` | Collect rule-based findings from QS[].f |
| `buildResults()` | Render all results sections to the DOM |
| `kickAnimation()` | Animate score counter and gauge bar |
| `saveAudit()` | Append record to localStorage |
| `downloadPDF()` | Build PDF HTML string, open in new tab |
| `startOver()` | Reset S, clear form fields, go to welcome |

---

## 16. Data Flow

```
User fills Company Info (Q1–Q4)
        │
        ▼
submitCompany() validates → S.company saved
        │
        ▼
buildQuestions() renders Q5–Q12
        │
        ▼
User selects answers
        │
        ▼
submitQuestions() validates → S.answers + S.submittedAt saved
        │
        ▼
go('processing') → runProcessing() starts
        │
        ├─► calcScore() → S.score
        ├─► riskProfile(S.score) → S.risk
        │
        ├─► generateAIAnalysis()  ──[success]──► S.analysis, S.aiPowered = true
        │         │
        │         └──[error]──► generateFallbackAnalysis() → S.analysis, S.aiPowered = false
        │
        ▼
buildResults() renders all DOM sections
        │
        ├─► saveAudit() → localStorage['fcc-audit-log']
        │
        ▼
go('results') + kickAnimation()
        │
        ▼ (optional)
downloadPDF() → window.open() → print dialog
```

---

## 17. Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | Full |
| Edge | 90+ | Full |
| Firefox | 88+ | Full |
| Safari | 14+ | Full |
| Opera | 76+ | Full |
| Chrome Android | 90+ | Full |
| Safari iOS | 14+ | Full |

**Requirements:** ES2020 (optional chaining `?.`, nullish coalescing `??`), async/await, `fetch`, `localStorage`, CSS custom properties, CSS Grid, CSS Flexbox.

---

## 18. Security Notes

### API Key Exposure

The Gemini API key is visible in the client-side HTML source. Anyone who views the page source or opens DevTools can see it. This is a fundamental limitation of any client-side API integration.

**Mitigations:**
1. Restrict the key to your domain in Google Cloud Console (see [Section 12](#12-google-gemini-api))
2. Set a spending limit on your Google Cloud account to cap potential abuse costs
3. Rotate the key periodically

For a higher-security deployment, consider building a lightweight server-side proxy that holds the API key and forwards requests — but this requires a backend and is beyond the scope of this single-file application.

### localStorage

Audit records are stored in the browser's localStorage. This means:
- Records are accessible to any JavaScript running on the same origin
- Records are not encrypted
- Records are not accessible from other devices or browsers

Do not store sensitive or confidential information in Q1–Q4 fields beyond what is needed for the report.

### Input Sanitization

All user input is inserted into the DOM via `textContent` or template literals used in `innerHTML`. Question text and answer options come from the hardcoded `QS` constant (not user input), so XSS risk is limited to the four company form fields. These fields are inserted into the PDF via template literals inside a `window.open()` document, which is same-origin.

For a production deployment handling sensitive data, consider adding explicit HTML escaping for all user-supplied values before DOM insertion.

---

## 19. Troubleshooting

### Results show "None identified." in all sections

**Cause:** The AI call failed and the fallback engine also found no findings for the given answers. This is unlikely but can happen if all answers map to `Yes` and the fallback has no `w` or `r` findings for `Yes` answers (expected — `Yes` only produces strengths).

**Fix:** Check the browser console for `Gemini API unavailable` warnings. If the fallback ran, verify you have at least one non-Yes answer — only non-Yes answers generate weaknesses and recommendations.

---

### PDF button opens a blank tab

**Cause:** The browser blocked the popup.

**Fix:** Allow popups for your domain. In Chrome: click the popup blocked icon in the address bar → Always allow popups from this site.

---

### AI analysis is generic / not personalized

**Cause:** The fallback engine ran instead of Gemini.

**Fix:** Open DevTools → Console and look for `Gemini API unavailable, using built-in engine: [reason]`. Common reasons:
- `API_KEY_INVALID` — the key is wrong or has been deleted
- `PERMISSION_DENIED` — the key is restricted to a domain that doesn't match your current origin
- `QUOTA_EXCEEDED` — you've hit the free tier limit for the day
- `Failed to fetch` — network issue or CORS block (common when opening as `file://`)

---

### Answers not saved / survey resets unexpectedly

**Cause:** The page was refreshed mid-survey. The state object `S` lives in memory and is lost on page reload.

**Fix:** This is by design for a stateless, single-file app. Do not refresh the page during a survey session.

---

### localStorage quota exceeded error

**Cause:** The browser's localStorage is full (typically limited to 5–10 MB). This would require thousands of submissions from the same browser.

**Fix:** Clear old records: `localStorage.removeItem('fcc-audit-log')` or export them first and then clear.

---

## 20. File Structure

```
servay/
├── survey.html    ← Complete application (the only file needed to run the app)
└── README.md      ← This documentation
```

`survey.html` internal structure:

```
<!DOCTYPE html>
  <head>
    <meta charset, viewport, title>
    <style>
      :root { /* CSS custom properties */ }
      /* Shell, topbar, progress bar */
      /* Views (display:none / .active) */
      /* Step indicator */
      /* Cards */
      /* Welcome hero */
      /* Form inputs and validation */
      /* Question blocks and radio buttons */
      /* Buttons */
      /* Processing animation */
      /* Results instrument (score + gauge) */
      /* Analysis sections */
      /* Findings table */
      /* Audit grid */
      /* Responsive overrides */
    </style>
  </head>
  <body>
    <header>   <!-- Topbar: logo + version -->
    <div>      <!-- Progress strip -->
    <main>
      #view-welcome     <!-- Hero + features + Begin button -->
      #view-company     <!-- Q1–Q4 form fields -->
      #view-questions   <!-- Q5–Q12 radio groups (built by JS) -->
      #view-processing  <!-- Animated spinner + status messages -->
      #view-results     <!-- Score gauge, analysis, table, audit, PDF button -->
    </main>
    <script>
      /* Constants: VER, GEMINI_KEY, GEMINI_URL, SCORE */
      /* QS array: all 8 questions with options and fallback findings */
      /* State object: S = {} */
      /* Navigation: go(), renderSteps() */
      /* Company: submitCompany() */
      /* Questions: buildQuestions(), submitQuestions() */
      /* Processing: runProcessing(), PROC_MSGS */
      /* Gemini: generateAIAnalysis() */
      /* Fallback: generateFallbackAnalysis() */
      /* Scoring: calcScore(), riskProfile(), answerRisk() */
      /* Results: buildResults(), kickAnimation() */
      /* Audit: saveAudit() */
      /* PDF: downloadPDF() */
      /* Utilities: startOver() */
      /* Init: go('welcome') */
    </script>
  </body>
```

---

## 21. Technical Reference

| Property | Value |
|----------|-------|
| Application file | `survey.html` |
| Total lines of code | ~805 (HTML + CSS + JS in one file) |
| External dependencies | None |
| CSS framework | None (custom CSS only) |
| JavaScript framework | None (vanilla JS) |
| AI provider | Google Gemini 1.5 Flash |
| API endpoint | `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent` |
| API authentication | Query parameter `?key=` |
| PDF generation | `window.open()` + `window.print()` |
| State management | Plain JS object (`let S = {}`) |
| View routing | CSS `.active` class toggle |
| Persistence | `localStorage` key: `fcc-audit-log` |
| Survey version constant | `VER = '1.0'` |
| Max score | 80 |
| Questions | 12 total (4 info + 8 compliance) |
| Scored questions | 8 (Q5–Q12) |
| Risk levels | 4 (Low / Moderate / Elevated / High) |
| PDF sections | 4 (Cover, Summary, Detailed Findings, Audit Record) |
| Audit fields per record | 8 |
| Browser support | All modern browsers (ES2020+) |
| Mobile responsive | Yes (breakpoint at 540px) |
| Reduced motion support | Yes (`prefers-reduced-motion`) |
| Approximate survey time | 3–5 minutes |
| AI response time | 2–4 seconds (Gemini) |

---

*FCC Compliance Readiness Mini-Survey — Survey v1.0*  
*Proprietary. For use by authorized FCC compliance consultants only.*
