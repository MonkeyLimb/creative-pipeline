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
  page.js                    — Main UI (tabs, selectors, cards, theme, agent job status)
  layout.js                  — Root layout, fonts, sonner Toaster
  globals.css                — CSS custom properties, animations, theme tokens
  api/
    agent/
      jobs/route.js            — POST: Create agent job (proxy to backend or mock)
      jobs/[id]/route.js       — GET: Poll agent job status
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

agent/
  server.js                  — Express agent backend (shells out to claude CLI + Canva MCP)
  package.json               — Agent server dependencies (express, cors, uuid)
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

## Current Workflow: Smart Prompt Handoff to Claude Chat

### Why Not Full Automation?
After exhaustive testing, Canva MCP requires interactive browser OAuth. No programmatic API, VPS agent, or desktop app (Cowork, Claude Code CLI) exposes an HTTP endpoint for a web app to call. The automation ceiling is Canva's OAuth wall.

### What Was Built Instead
The "Copy for Claude Chat" button generates a **self-executing prompt file** — not just raw CSV data, but a complete set of instructions that tells Claude exactly what to do when pasted into claude.ai with Canva MCP enabled.

### The Prompt File Includes:
1. **Step 0: Canva MCP verification** — Claude checks if Canva tools are available before starting. If not connected, it stops and tells the user to enable Canva MCP first.
2. **Step 1: Folder creation** — Creates an organized Canva folder named `{School} - {Program} - {Platform} {Type} Ads`
3. **Step 2: Per-ad design generation** — For each ad row:
   - `generate_design` with the AI visual prompt and correct platform dimensions
   - `perform_editing_operations` to add hook text, subtext, and CTA
   - `move_item_to_folder` to organize into the created folder
   - Reports design URL before moving to next ad
4. **Compliance rules embedded** — School-specific rules (degree vs certificate language, financial aid wording, urgency restrictions) are baked into the prompt so Claude enforces them during design generation
5. **Step 3: Summary table** — After all designs, outputs a table of all design URLs

### User Workflow:
1. Generate ads in the web app (select school, program, platform, etc.)
2. Click "Copy for Claude Chat" (orange button) — copies the smart prompt
3. Open claude.ai with Canva MCP enabled
4. Paste — Claude verifies Canva, then generates all designs automatically
5. Get back a summary table with all Canva design URLs

### UI Buttons:
- **Copy for Claude Chat** (orange, primary) — copies the full smart prompt with instructions + compliance rules + all ad data
- **Download .md** (violet) — downloads the prompt as a markdown file (for archiving or sharing)
- **CSV** (green) — downloads raw CSV data only (for spreadsheet use)

### Legacy: Agent Backend (Still in Repo)
The `agent/` directory contains an Express server that was built for a programmatic approach (shelling out to `claude` CLI). It's preserved in case a future Canva API update enables programmatic OAuth, but is **not currently used** by the web app. The `AGENT_BASE_URL` env var and proxy routes (`/api/agent/jobs`) are still functional but unused.

---

## Environment Variables (Vercel)

| Variable | Purpose | Status |
|----------|---------|--------|
| `ANTHROPIC_API_KEY` | Claude API calls | Working ($4.67 remaining of $5) |
| `CANVA_ACCESS_TOKEN` | Canva REST API (4hr expiry) | Needs re-auth via /api/canva-auth |
| `CANVA_REFRESH_TOKEN` | Token refresh (DO NOT auto-refresh — single-use, breaks chain) | Likely revoked |
| `CANVA_CLIENT_ID` | Canva OAuth app | OC-AZ1RKS_XeaXO |
| `CANVA_CLIENT_SECRET` | Canva OAuth app | Set in Vercel (not in code) |
| `AGENT_BASE_URL` | Legacy: agent backend URL (unused — smart prompt approach replaced this) | Not set |

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
