# Dreambound Creative Pipeline — Handoff Document

## Project Overview

Internal web app for **Dreambound** (education marketplace). It's a **prompt builder**: marketers fill out a wizard, click "Copy Prompt", paste into Claude.ai, and let the chat generate the content (and create Canva designs on the Ads tab). Built with Next.js (App Router) on Vercel.

**Live URL:** https://creative-pipeline-mu.vercel.app/
**Repo:** MonkeyLimb/creative-pipeline

There is **no Anthropic API call** from this web app anymore. All generation happens in Claude.ai chat after the user pastes the prompt.

---

## Tabs

### Tab 1 — Content Calendar
A 5-step wizard that builds a single prompt for an organic content calendar:

1. **Creative Brief** — required text describing the campaign direction.
2. **Schedule & Platforms** — pick dates or a date range; pick Instagram / Facebook / TikTok.
3. **School & Program** — drives compliance rules and program-specific copy.
4. **Content Format** — optional Image / Video / Carousel counts. Skipped means Claude defaults to Image (4:5) and Video (9:16).
5. **Content Engine** — Track A (Conversion), Track B (Community), or Mixed; per-bucket post counts.

Click **Copy Prompt for Claude** → paste into claude.ai → Claude returns a markdown table of the calendar.

The "Selling to Feeling" framework is embedded in the prompt:

| Track | Bucket | Directive |
|-------|--------|-----------|
| A — Despair | A — Internal Conflict | Self-doubt, imposter syndrome, fear of change |
| A — Despair | B — Effort-Reality Gap | Working hard but getting nowhere |
| A — Hope | C — Emotional Validation | Make the reader feel seen and understood |
| A — Hope | D — Motivational Reframing | Reframe stuck as starting |
| A — Bridge | E — Private Desire | Quiet ambitions people don't say out loud |
| A — Bridge | F — Possible Paths Exist | Plant seeds of possibility without hard-selling |
| B — Community | G — Relatable Vent | Humor about universal work struggles |
| B — Community | H — Unpopular Opinion | Hot takes on workplace/hustle culture |
| B — Community | I — Hype-Up | Quotable inspiration about refusing to settle |

### Tab 2 — Ad Creatives
Wizard for school, program, platform, type (Paid/Organic), format (Single/Carousel), ad count, ICPs, tones, hook archetypes, extra context.

Two action buttons:
- **Copy for Canva** — prompt that asks Claude.ai to (a) write the ads and (b) generate Canva designs from AI visual prompts.
- **Pexels + Style** — same as above but Claude searches Pexels for stock photos and styles them with the per-ad font specs.

Both prompts include compliance rules and tell Claude to verify Canva MCP first.

---

## Architecture

```
app/
  page.js                      — Nav, theme, header, PaidAdsTab, primitives
  layout.js                    — Root layout, fonts, sonner Toaster
  globals.css                  — CSS custom properties, animations, theme tokens
  content-engine/
    ContentEngineTab.js        — Content Calendar wizard + buildContentPrompt()
  api/
    canva-auth/route.js        — GET: Canva OAuth flow initiation
    canva-callback/route.js    — GET: Canva OAuth callback + token exchange
    commit-row/route.js        — POST: SVG preview + Canva REST API design creation (legacy, partial)
  lib/
    canva-client.js            — Canva REST API wrapper
    svg-generator.js           — Server-side SVG ad template generator
```

The wizard is fully client-side. The only server routes left are the Canva OAuth flow and the legacy `commit-row` (kept in case the Canva REST integration is revived).

---

## School / Program Mapping

Programs are filtered by school in the UI:

| School | Programs |
|--------|----------|
| General | Brand Awareness, Platform Growth, Community, Partnerships, Events |
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

Embedded in both prompt builders (`buildContentPrompt` in `ContentEngineTab.js`, `complianceLines()` + `adGenSection()` in `app/page.js`):

- **Dreambound is the ONLY public brand.** No school names in copy ever.
- No employment guarantees, outcome promises, or job placement language.
- No "guarantee", "free", "dream career", "Fast Track".
- **Degree programs** (UMA, SNHU, AIU, CTU, FSU): "study" and "education" only. Never "train"/"training". "Career" must pair with "path" or "journey".
- **Certificate programs** (CCI, Herzing, MedCerts): "training" is acceptable. CCI: urgency language OK.
- **FSU:** Financial aid line must read exactly "Financial Aid is available for those who qualify."
- **Other paid:** "Financial aid may be available for those who qualify."
- **AIU and CTU:** No urgency language. Always append "Completion times vary according to the individual student."

---

## Why No Server-Side Generation

Two reasons the API was removed:

1. **Anthropic credits** — the project is no longer funded for API usage.
2. **Claude.ai is a better surface for this** — multimodal attachments, longer outputs, and the Canva MCP step happens there anyway.

The previous `/api/generate-content-engine` and `/api/generate-ads-csv` routes have been deleted along with their Anthropic SDK dependency.

---

## The Canva Integration Story

Canva MCP requires interactive browser OAuth — no static token, API key, or programmatic flow can authenticate with it. `generate-design`, `perform-editing-operations`, and other AI tools are exclusively available through Canva's MCP server.

That's why the Ad Creatives tab outputs a **prompt** that gets pasted into claude.ai with Canva MCP enabled — Claude in the chat has the OAuth'd MCP connection that the web app cannot have.

The legacy Canva REST routes (`canva-auth`, `canva-callback`, `commit-row`, `lib/canva-client.js`) are kept on the off-chance the integration is revived; they are not currently wired into either tab.

---

## Environment Variables (Vercel)

| Variable | Purpose | Status |
|----------|---------|--------|
| `CANVA_ACCESS_TOKEN` | Canva REST API (4hr expiry) — used only by legacy `commit-row` | Optional |
| `CANVA_REFRESH_TOKEN` | Token refresh (DO NOT auto-refresh — single-use) | Optional |
| `CANVA_CLIENT_ID` | Canva OAuth app | Optional |
| `CANVA_CLIENT_SECRET` | Canva OAuth app | Optional |

**Important:** the `getToken()` function in `app/lib/canva-client.js` must NOT auto-refresh. Each refresh_token is single-use; refreshing on row 1 invalidates the token for row 2.

The wizard tabs need **no env vars** to function — they build prompts client-side.

---

## Tech Stack

- **Next.js 15** (App Router) on Vercel
- **React 19**
- **Tailwind CSS 4** with PostCSS
- **framer-motion** — collapsible animations and tab transitions
- **sonner** — toast notifications
- **Inter** font from Google Fonts

---

## Key Files to Read First

1. `app/content-engine/ContentEngineTab.js` — Content Calendar wizard + `buildContentPrompt()`
2. `app/page.js` — `PaidAdsTab` with `buildPrompt()` and `buildPexelsPrompt()`, plus nav/theme/primitives
3. `app/lib/canva-client.js` — Canva REST API wrapper (only relevant if you revive the legacy commit-row flow)

---

## What NOT to Do

1. **Don't add the Anthropic SDK back** unless there's a budget for it; the prompt-handoff pattern is intentional.
2. **Don't try to use Canva MCP from Vercel** — exhaustively proven impossible due to OAuth.
3. **Don't auto-refresh Canva tokens** — breaks the token chain between rows.
4. **Don't add the `resource` parameter to Canva OAuth** — Canva rejects it.
