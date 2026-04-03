# Dreambound Creative Pipeline — Handoff Document

## Project Overview

Internal web app for **Dreambound** (education marketplace) that generates compliant ad copy and content calendars for partner schools. Built with Next.js (App Router) on Vercel.

**Live URL:** https://creative-pipeline-mu.vercel.app/
**Repo:** MonkeyLimb/creative-pipeline
**Branch:** `claude/dreambound-creative-pipeline-mFkV9`

---

## Current State (What Works)

### Tab 1: Content Calendar Builder
- Tap-to-select UI: school, program, platform, sizes, ICPs, tones, hook archetypes, date range, post count
- Claude API (`claude-sonnet-4-6`) generates compliant content briefs with full compliance rules per school
- Expandable post cards with all brief fields
- CSV export that opens in Google Sheets (structured brief format + flat table)

### Tab 2: Paid Ads CSV Generator
- Same selector UI for school/program/platform/creative type
- Claude API generates compliant ad copy with hook text, subtext, CTA, AI visual prompts
- CSV preview with "Copy for Claude AI" button (copies to clipboard)
- Download CSV button
- The CSV is designed to be pasted into claude.ai chat where Canva MCP generates the actual designs

### UI/UX
- Light/dark mode toggle (localStorage persisted, system preference detected)
- framer-motion animations (staggered card entrance, smooth expand/collapse, tab transitions)
- sonner toasts for success/error feedback
- Premium dark theme (Linear/Vercel-inspired warm neutrals)
- Inter font, CSS custom properties for theming
- Dismissable "Getting Started" guide

---

## Architecture

```
app/
  page.js                    — Main UI (tabs, selectors, cards, theme)
  layout.js                  — Root layout, fonts, sonner Toaster
  globals.css                — CSS custom properties, animations, theme tokens
  api/
    generate-calendar/route.js  — POST: Claude generates content calendar briefs
    generate-ads-csv/route.js   — POST: Claude generates paid ad copy
    export-csv/route.js         — POST: Generates downloadable CSV file
    generate-copy/route.js      — POST: Original copy generation (legacy)
    commit-row/route.js         — POST: SVG preview + Canva REST API design creation (partially working)
    canva-auth/route.js         — GET: Canva OAuth flow initiation
    canva-callback/route.js     — GET: Canva OAuth callback + token exchange
  lib/
    canva-client.js             — Canva REST API wrapper (createDesign, getDesign, folders)
    svg-generator.js            — Server-side SVG ad template generator
```

---

## School/Program Mapping

Programs are filtered by school in the UI:

| School | Programs |
|--------|----------|
| UMA | Clinical Medical Assistant, Healthcare Management, Healthcare Administration, Medical Billing and Coding, Health and Human Services, Medical Administrative Assistant, Pharmacy Technician, Health Information Technology |
| SNHU | Psychology |
| AIU | Criminal Justice |
| CTU | Information Technology |
| FSU | Music Production, Game Development, Cybersecurity, Information Technology |
| CCI | Pharmacy Technician, Radiology, Medical Billing and Coding, Medical Assistant |
| Herzing | Sterile Processing Technician |
| MedCerts | Phlebotomy Technician, EKG Technician |

---

## Compliance Rules (Critical)

These are embedded in the Claude system prompts for both calendar and ads generation:

- **Dreambound is the ONLY public brand.** No school names in copy ever.
- No employment guarantees, outcome promises, or job placement language.
- No "guarantee", "free", "dream career", "Fast Track".
- **Degree programs** (UMA, SNHU, AIU, CTU, FSU): "study" and "education" only. Never "train"/"training". "Career" must pair with "path" or "journey".
- **Certificate programs** (CCI, Herzing, MedCerts): "training" is acceptable. CCI: urgency language OK.
- **FSU:** Financial aid line must read exactly "Financial Aid is available for those who qualify."
- **All other paid:** "Financial aid may be available for those who qualify."
- **AIU and CTU:** No urgency language. Always append "Completion times vary according to the individual student."

---

## The Canva Problem (Critical Context)

### What We Tried
The original goal was full automation: CSV → copy → Canva AI design generation → folder organization → design URLs back in the web app.

We exhaustively tried:
1. **Anthropic API `mcp_servers` parameter** with Canva MCP — Canva's OAuth requires interactive browser login, rejects all programmatic tokens
2. **Canva Connect REST API** — Can create blank designs and manage folders, but has NO AI generation, NO text editing, NO template autofill endpoints
3. **Manual MCP client** (direct HTTP to mcp.canva.com) — Same OAuth rejection
4. **Composio proxy** — Doesn't expose Canva's `generate-design` tool
5. **Make.com / N8N / Gumloop / Zapier** — None have Canva AI generation; autofill requires Enterprise plan
6. **Claude image generation via API** — Claude cannot generate images through the Messages API
7. **Resource indicators (RFC 8707)** on OAuth token exchange — Canva rejects the `resource` parameter
8. **Anthropic Console MCP Connectors** — Configured per-user in claude.ai, not transferable to API keys

### Root Cause
Canva's MCP server uses its own OAuth with interactive browser login. No static token, API key, or programmatic flow can authenticate with it. The `generate-design`, `perform-editing-operations`, and other AI tools are exclusively available through this MCP server.

### What Works
- Canva MCP works perfectly in **claude.ai chat** and **Claude Code CLI** (this session)
- The web app generates the CSV with all the right columns
- User copies CSV → pastes into claude.ai → Claude generates Canva designs
- This is the current production workflow

---

## Next Step: "Send to Agent" Flow

### The Plan
Add a "Send to Agent" button to the Paid Ads tab that sends generated ad rows to a backend agent capable of running Canva MCP. The web app polls for job status and displays design URLs when complete.

### Architecture
```
Web App (Vercel)
  → POST /api/agent/jobs (proxy)
    → AGENT_BASE_URL /v1/jobs (external agent with Canva MCP)
  ← Job ID

  → GET /api/agent/jobs/:id (poll)
    → AGENT_BASE_URL /v1/jobs/:id
  ← Status + design URLs per row
```

### What Needs Building

**In this repo (web app side):**
1. `POST /api/agent/jobs` — accepts ad rows, proxies to agent, returns job ID
2. `GET /api/agent/jobs/[id]` — polls agent for job status
3. "Send to Agent" button in Paid Ads UI
4. Job status UI with per-row progress + design URL links
5. For now: mock agent responses so the UI flow demos end-to-end

**Separately (agent backend — not built yet):**
- A persistent process (not serverless) with Canva MCP configured
- Could be: Claude Agent SDK, Express server shelling to `claude` CLI, or hosted agent platform
- Needs to handle Canva OAuth once (browser popup) then maintain session
- Accepts JSON payload of ad rows, processes sequentially, returns design URLs

### Job Payload Shape
```json
// POST /v1/jobs
{
  "school": "SNHU",
  "program": "Psychology",
  "platform": "Instagram",
  "creative_type": "Paid",
  "rows": [
    {
      "hook_text": "Too busy for traditional college?",
      "subtext": "SNHU's Psych degree is 100% online.",
      "cta": "Study on your schedule. Apply now.",
      "ai_visual_prompt": "Split screen showing a parent...",
      "hook_format": "objection flip",
      "messaging_archetype": "Hope"
    }
  ]
}

// GET /v1/jobs/:id response
{
  "id": "job_abc123",
  "status": "running",  // pending | running | completed | failed
  "total": 5,
  "completed": 2,
  "failed": 0,
  "rows": [
    { "index": 0, "status": "completed", "design_url": "https://canva.com/design/...", "folder_url": "..." },
    { "index": 1, "status": "completed", "design_url": "https://canva.com/design/...", "folder_url": "..." },
    { "index": 2, "status": "running", "design_url": null, "folder_url": null },
    { "index": 3, "status": "pending", "design_url": null, "folder_url": null },
    { "index": 4, "status": "pending", "design_url": null, "folder_url": null }
  ]
}
```

---

## Environment Variables (Vercel)

| Variable | Purpose | Status |
|----------|---------|--------|
| `ANTHROPIC_API_KEY` | Claude API calls | Working ($4.67 remaining of $5) |
| `CANVA_ACCESS_TOKEN` | Canva REST API (4hr expiry) | Needs re-auth via /api/canva-auth |
| `CANVA_REFRESH_TOKEN` | Token refresh (DO NOT auto-refresh — single-use, breaks chain) | Likely revoked |
| `CANVA_CLIENT_ID` | Canva OAuth app | OC-AZ1RKS_XeaXO |
| `CANVA_CLIENT_SECRET` | Canva OAuth app | Set in Vercel (not in code) |
| `AGENT_BASE_URL` | Future: agent backend URL | Not set yet |

**Important:** The canva-client.js `getToken()` function must NOT auto-refresh. Each refresh_token is single-use — refreshing on row 1 invalidates the token for row 2. Just use the stored access token directly.

---

## Tech Stack

- **Next.js 15** (App Router) on Vercel
- **React 19**
- **Tailwind CSS 4** with PostCSS
- **@anthropic-ai/sdk 0.82.0** — supports `mcp_servers` beta (though Canva auth blocks it)
- **framer-motion** — card animations, tab transitions
- **sonner** — toast notifications
- **Inter** font from Google Fonts

---

## Key Files to Read First

1. `app/page.js` — The entire UI (both tabs, all components)
2. `app/api/generate-ads-csv/route.js` — Paid ads generation with compliance rules
3. `app/api/generate-calendar/route.js` — Content calendar generation
4. `app/lib/canva-client.js` — Canva REST API wrapper (understand the token issue)

---

## What NOT to Do

1. **Don't try to use Canva MCP from Vercel** — it's been exhaustively proven impossible due to OAuth
2. **Don't auto-refresh Canva tokens** — breaks the token chain between rows
3. **Don't remove existing Canva routes** — they partially work for blank design creation + folder organization
4. **Don't add the `resource` parameter to Canva OAuth** — Canva rejects it
5. **Don't use the older `mcp-client-2025-04-04` beta** — use `mcp-client-2025-11-20` with `mcp_toolset` in tools array if attempting MCP again
