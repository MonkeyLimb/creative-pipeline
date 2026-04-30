"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import ContentEngineTab from "./content-engine/ContentEngineTab";

const SP = {
  General: ["Brand Awareness", "Platform Growth", "Community", "Partnerships", "Events"],
  UMA: ["Clinical Medical Assistant", "Healthcare Management", "Healthcare Administration", "Medical Billing and Coding", "Health and Human Services", "Medical Administrative Assistant", "Pharmacy Technician", "Health Information Technology"],
  SNHU: ["Psychology"], AIU: ["Criminal Justice"], CTU: ["Information Technology"],
  FSU: ["Music Production", "Game Development", "Cybersecurity", "Information Technology"],
  CCI: ["Pharmacy Technician", "Radiology", "Medical Billing and Coding", "Medical Assistant"],
  Herzing: ["Sterile Processing Technician"], MedCerts: ["Phlebotomy Technician", "EKG Technician"],
};
const SCHOOLS = Object.keys(SP);
const PLATFORMS = ["Instagram", "Facebook", "TikTok"];
const CT = ["Paid", "Organic"];
const FORMATS = ["Single", "Carousel"];
const ICPS = ["Working Adult", "Career Reset", "Ambition Blocker"];
const TONES = ["Recognition", "Belief", "Awareness"];
const HOOKS = ["Objection Flip", "Stat/Fact", "Day in the Life", "Pain Point", "Transformation", "Curiosity"];

const AC = [1, 3, 5, 7, 10, 15];

function useTheme() {
  const [dark, setDark] = useState(true);
  useEffect(() => { try { const t = localStorage.getItem("theme"); const d = t === "dark" || (!t && matchMedia("(prefers-color-scheme:dark)").matches); setDark(d); document.documentElement.classList.toggle("dark", d); } catch {} }, []);
  const toggle = () => { const n = !dark; setDark(n); document.documentElement.classList.toggle("dark", n); try { localStorage.setItem("theme", n ? "dark" : "light"); } catch {} };
  return { dark, toggle };
}

// ─── Primitives ───
const MotionDiv = motion.div;

function Chip({ label, active, onClick }) {
  return (
    <button onClick={onClick} className="relative cursor-pointer" style={{ padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600, border: "1px solid transparent", transition: "all 0.2s", ...(active ? { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)", boxShadow: "var(--accent-glow)" } : { background: "var(--bg-inset)", color: "var(--text-secondary)", borderColor: "var(--border)" }) }}>
      {label}
    </button>
  );
}

function MChip({ label, active, onClick }) {
  return (
    <button onClick={onClick} className="cursor-pointer flex items-center gap-1.5" style={{ padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 500, transition: "all 0.2s", ...(active ? { background: "var(--accent-bg)", color: "var(--accent)", border: "1px solid var(--accent-border)" } : { background: "var(--bg-inset)", color: "var(--text-tertiary)", border: "1px solid var(--border)" }) }}>
      {active && <span style={{ width: 5, height: 5, borderRadius: 99, background: "var(--accent)" }} />}{label}
    </button>
  );
}

function Lbl({ children }) { return <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-tertiary)", marginBottom: 8 }}>{children}</div>; }

function Card({ children, className = "" }) { return <div className={className} style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 16, boxShadow: "var(--card-shadow)" }}>{children}</div>; }

function Sel({ value, onChange, options }) {
  return <select value={value} onChange={(e) => onChange(e.target.value)} style={{ width: "100%", background: "var(--bg-inset)", border: "1px solid var(--border)", borderRadius: 10, padding: "9px 14px", fontSize: 13, color: "var(--text)", outline: "none", cursor: "pointer" }}>{options.map((o) => <option key={o} value={o}>{o}</option>)}</select>;
}

function SPSelect({ school, program, onS, onP }) {
  const isGeneral = school === "General";
  return (
    <div className={`grid gap-4 ${isGeneral ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2"}`}>
      <div><Lbl>School</Lbl><Sel value={school} onChange={onS} options={SCHOOLS} /></div>
      <div><Lbl>{isGeneral ? "Focus" : "Program"}</Lbl><Sel value={program} onChange={onP} options={SP[school] || []} /></div>
    </div>
  );
}

// ─── Guide Sidebar ───
function GuideSidebar({ open, onClose }) {
  const data = [
    { t: "Content Calendar", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", steps: ["Write a creative brief", "Pick dates, platforms, school + program", "Optionally set format mix (image/video/carousel)", "Set posts-per-bucket using the Selling to Feeling framework", "Click Copy Prompt — paste into Claude.ai", "Claude generates the full content calendar in chat"] },
    { t: "Ad Creatives", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", steps: ["Pick school, program, platform, type, format", "Select ICPs, tones, hook archetypes, ad count", "Click Copy for Canva — paste into Claude.ai with Canva MCP", "Claude writes the ads and creates Canva designs in one pass", "Or use Pexels + Style for stock-photo designs instead"] },
  ];
  return (
    <AnimatePresence>
      {open && (
        <>
          <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 40 }} />
          <MotionDiv initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 26, stiffness: 300 }} style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "min(380px, 90vw)", background: "var(--bg)", borderLeft: "1px solid var(--border)", zIndex: 50, overflowY: "auto", boxShadow: "-4px 0 24px rgba(0,0,0,0.12)" }}>
            <div style={{ padding: "24px 20px" }}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--accent-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>Getting Started</span>
                </div>
                <button onClick={onClose} className="cursor-pointer" style={{ background: "var(--bg-inset)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 8px", color: "var(--text-tertiary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="space-y-8">
                {data.map((s) => (
                  <div key={s.t}>
                    <div className="flex items-center gap-2 mb-3"><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={s.icon} /></svg><span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.t}</span></div>
                    <div className="space-y-2.5">{s.steps.map((step, j) => (
                      <div key={j} className="flex gap-2.5 items-start">
                        <span style={{ fontSize: 10, fontWeight: 800, color: "var(--accent)", background: "var(--accent-bg)", borderRadius: 5, padding: "1px 6px", minWidth: 20, textAlign: "center", marginTop: 2 }}>{j + 1}</span>
                        <span style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{step}</span>
                      </div>
                    ))}</div>
                  </div>
                ))}
              </div>
            </div>
          </MotionDiv>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Tabs ───

function PaidAdsTab() {
  const [school, setSchool] = useState("General");
  const [program, setProgram] = useState(SP["General"][0]);
  const [plat, setPlat] = useState("Instagram");
  const [ct, setCt] = useState("Paid");
  const [fmt, setFmt] = useState("Single");
  const [icps, setIcps] = useState(["Working Adult"]);
  const [tones, setTones] = useState(["Recognition"]);
  const [hooks, setHooks] = useState(["Objection Flip", "Transformation"]);
  const [ac, setAc] = useState(5);
  const [ctx, setCtx] = useState("");
  const [copiedKey, setCopiedKey] = useState(null);
  const [showMore, setShowMore] = useState(false);
  const [showPreview, setShowPreview] = useState(null);
  const tog = (a, s, v) => s((p) => p.includes(v) ? p.filter((x) => x !== v) : [...p, v]);
  const sc = (s) => { setSchool(s); setProgram(SP[s]?.[0] || ""); };
  const isGeneral = school === "General";

  // ─── Build the smart prompt file for Claude.ai + Canva MCP ───
  const DEGREE_SCHOOLS = ["UMA", "SNHU", "AIU", "CTU", "FSU"];

  const complianceLines = () => {
    const isDegree = DEGREE_SCHOOLS.includes(school);
    const lines = [
      `- Dreambound is the ONLY brand name.${!isGeneral ? ` NEVER put "${school}" or any school name in the design.` : ""}`,
      `- No employment guarantees, outcome promises, or job placement language.`,
      `- No "guarantee", "free", "dream career", "Fast Track".`,
    ];
    if (!isGeneral && isDegree) lines.push(`- This is a DEGREE program: use "study" and "education" only. Never "train"/"training". "Career" must pair with "path" or "journey".`);
    if (!isGeneral && !isDegree) lines.push(`- This is a CERTIFICATE program: "training" is acceptable.${school === "CCI" ? " Urgency language is OK." : ""}`);
    if (isGeneral) lines.push(`- General Dreambound content: focus on brand values, education marketplace positioning, and aspirational messaging.`);
    if (school === "FSU") lines.push(`- FSU financial aid line: "Financial Aid is available for those who qualify." (exact wording)`);
    else if (!isGeneral && ct === "Paid") lines.push(`- Financial aid line: "Financial aid may be available for those who qualify."`);
    if (school === "AIU" || school === "CTU") lines.push(`- ${school}: No urgency language. Always include "Completion times vary according to the individual student."`);
    return lines.join("\n");
  };

  const adGenSection = () => `## STEP A: Write the ${ac} Ads
You are a compliant paid ad copywriter for Dreambound.
School: ${school} | Program: ${program} | Platform: ${plat} | Creative type: ${ct} | Format: ${fmt}

Generate exactly ${ac} unique paid ad creatives. Distribute across these combinations (vary as much as possible — different ICP + tone + hook per ad):
- ICP targets: ${icps.join(", ")}
- Tones: ${tones.join(", ")}
- Hook archetypes: ${hooks.join(", ")}

Each ad must:
- Use a different ICP + tone + hook combination
- Have a compelling, scroll-stopping hook
- Use B-roll + text overlay style for any visual direction (NO talking-head or selfie videos — we use thematic B-roll footage with bold on-screen text)
- Be fully compliant with the rules below

${ctx ? `Additional context:\n${ctx}\n` : ""}
For each ad, produce these fields:
- Hook Format: the hook archetype used
- Messaging Archetype: the messaging archetype/tone
- Hook Text: the headline (large, bold, scroll-stopping)
- Subtext: supporting body copy
- CTA: call to action text
- AI Visual Prompt: detailed B-roll + text overlay description (setting, movement, mood, color grade, lighting, exact on-screen text, font style, placement)
- Pexels Query: 2-5 word search query for Pexels stock photo (literal scene, e.g. "clean clinic room" not "healthcare"; no brand names, no faces, no overlays)
- Font Color: hex color for headline text, picked for contrast against the likely Pexels image
- Font Weight: bold or normal
- Font Size: integer px (larger for short hooks)
- Font Style: normal or italic

COMPLIANCE RULES (CRITICAL):
${complianceLines()}

---

`;
  const buildPrompt = () => {
    const dims = { Instagram: "1080x1350 (4:5)", Facebook: "1080x1080 (1:1)", TikTok: "1080x1920 (9:16)" };
    const dim = dims[plat] || "1080x1350";
    const isCarousel = fmt === "Carousel";
    const folderName = isGeneral ? `Dreambound - ${program} - ${plat} ${ct}` : `${school} - ${program} - ${plat} ${ct}`;

    return `# Dreambound Canva Design Job
## STEP 0: Verify Canva MCP Connection
Before doing anything else, confirm you have access to Canva MCP tools. Try listing your available tools and verify you can see: generate_design, perform_editing_operations, create_folder, move_item_to_folder, and get_design.

If you do NOT have Canva connected:
- Tell me "Canva MCP is not connected. Please enable it in your MCP settings first."
- Stop here. Do not proceed.

If you DO have Canva connected, say "Canva MCP verified." and proceed to Step A.

---

${adGenSection()}## STEP B: Create Folder
Create a Canva folder named: "${folderName}"
Save the folder ID for organizing designs later.

---

## STEP C: Generate Designs (${ac} total${isCarousel ? " — CAROUSEL format" : ""})
For each ad you wrote in Step A, ONE AT A TIME:
1. Use generate_design with the AI Visual Prompt for that ad. Target size: ${dim}. Make it a ${plat} ${ct.toLowerCase()} ad.${isCarousel ? `
   - This is a CAROUSEL. Generate a multi-page design (3-5 slides per ad).
   - Slide 1: Hook Text as bold headline with striking visual.
   - Slides 2-3: Subtext broken across slides with supporting visuals.
   - Final slide: CTA with clear action button/text.
   - Keep visual theme consistent across all slides.` : ""}
2. Use perform_editing_operations to add the text elements:${isCarousel ? `
   - Distribute text across slides as described above.` : `
   - Hook Text as the primary headline (large, bold, high contrast)
   - Subtext as supporting body copy (smaller, below headline)
   - CTA as button or bottom banner text (clear, actionable)`}
3. Use move_item_to_folder to put the design in the folder from Step B.
4. Report the design URL before moving to the next ad.

---

## STEP D: Summary
After all ${ac} designs are generated, provide a summary table:
| Ad # | Hook Text (first 30 chars) | Design URL | Status |
|------|---------------------------|------------|--------|

Then confirm: "All ${ac} designs generated and organized in the '${folderName}' folder."
`;
  };

  const buildPexelsPrompt = () => {
    const dims = { Instagram: "1080x1350 (4:5)", Facebook: "1080x1080 (1:1)", TikTok: "1080x1920 (9:16)" };
    const dim = dims[plat] || "1080x1350";
    const isCarousel = fmt === "Carousel";
    const folderName = isGeneral ? `Dreambound - ${program} - ${plat} ${ct} (Pexels)` : `${school} - ${program} - ${plat} ${ct} (Pexels)`;

    return `# Dreambound Canva Design Job — Pexels Stock Photo
## STEP 0: Verify Canva MCP Connection
Before doing anything else, confirm you have access to Canva MCP tools. Try listing your available tools and verify you can see: generate_design, perform_editing_operations, create_folder, move_item_to_folder, upload_asset_from_url, start_editing_transaction, commit_editing_transaction, and get_design.

If you do NOT have Canva connected:
- Tell me "Canva MCP is not connected. Please enable it in your MCP settings first."
- Stop here. Do not proceed.

If you DO have Canva connected, say "Canva MCP verified." and proceed to Step A.

---

${adGenSection()}## STEP B: Create Folder
Create a Canva folder named: "${folderName}"
Save the folder ID for organizing designs later.

---

## STEP C: Build Designs from Pexels Stock Photos (${ac} total${isCarousel ? " — CAROUSEL format" : ""})
For each ad you wrote in Step A, ONE AT A TIME:

1. **Search Pexels:** Go to pexels.com and search for that ad's Pexels Query. Pick the top result. Copy its direct image URL.

2. **Upload to Canva:** Use upload-asset-from-url with the Pexels image URL. Name it after the ad (e.g. "Ad 1 - {first few words of hook}").

3. **Create a design:** Use generate_design. Target size: ${dim}. Make it a ${plat} ${ct.toLowerCase()} ad. Use the Pexels image as the primary background/visual.${isCarousel ? `
   - This is a CAROUSEL. Generate a multi-page design (3-5 slides per ad).
   - Slide 1: Hook Text as bold headline over the Pexels image.
   - Slides 2-3: Subtext broken across slides with the stock photo as background.
   - Final slide: CTA with clear action button/text.
   - Keep visual theme consistent across all slides.` : ""}

4. **Open design for editing:** Use start-editing-transaction with the design_id.

5. **Set the Pexels image as background fill:** Use perform-editing-operations → update_fill with the uploaded asset_id. Apply to all image fills where editable is true.

6. **Add and style the text elements:**${isCarousel ? `
   - Distribute text across slides as described above.` : `
   - Hook Text as the primary headline (large, bold, high contrast)
   - Subtext as supporting body copy (smaller, below headline)
   - CTA as button or bottom banner text (clear, actionable)`}
   Then use perform-editing-operations → format_text to apply the font styling from the ad spec (Font Color, Font Weight, Font Size, Font Style). Apply to ALL richtext element_ids in the design.

7. **Commit:** Use commit-editing-transaction.

8. Use move_item_to_folder to put the design in the folder from Step B.

9. Report the design URL before moving to the next ad.

---

## STEP D: Summary
After all ${ac} designs are created, provide a summary table:
| Ad # | Hook Text (first 30 chars) | Pexels Query | Design URL | Status |
|------|---------------------------|--------------|------------|--------|

Then confirm: "All ${ac} designs created with Pexels stock photos and organized in the '${folderName}' folder."
`;
  };

  const copyTo = (text, key, label) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`${label} — paste into Claude.ai`);
    setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 2500);
  };
  const copyPrompt = () => copyTo(buildPrompt(), "canva", "Canva prompt copied");
  const copyPexelsPrompt = () => copyTo(buildPexelsPrompt(), "pexels", "Pexels + Style prompt copied");
  const previewText = showPreview === "canva" ? buildPrompt() : showPreview === "pexels" ? buildPexelsPrompt() : "";
  return (
    <div className="space-y-6">
      <Card className="p-5 sm:p-7 space-y-5">
        <SPSelect school={school} program={program} onS={sc} onP={setProgram} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div><Lbl>Platform</Lbl><div className="flex gap-1.5 flex-wrap">{PLATFORMS.map((p) => <Chip key={p} label={p} active={plat === p} onClick={() => setPlat(p)} />)}</div></div>
          <div><Lbl>Type</Lbl><div className="flex gap-1.5 flex-wrap">{CT.map((t) => <Chip key={t} label={t} active={ct === t} onClick={() => setCt(t)} />)}</div></div>
          <div><Lbl>Format</Lbl><div className="flex gap-1.5 flex-wrap">{FORMATS.map((f) => <Chip key={f} label={f} active={fmt === f} onClick={() => setFmt(f)} />)}</div></div>
          <div><Lbl>Ads</Lbl><Sel value={ac} onChange={(v) => setAc(Number(v))} options={AC} /></div>
        </div>
        {/* Collapsible targeting options */}
        <button onClick={() => setShowMore(!showMore)} className="cursor-pointer flex items-center gap-1.5" style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", background: "none", border: "none", padding: 0 }}>
          <svg style={{ transform: showMore ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          Targeting & Context
        </button>
        <AnimatePresence>{showMore && (
          <MotionDiv initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div><Lbl>ICPs</Lbl><div className="flex gap-1.5 flex-wrap">{ICPS.map((i) => <MChip key={i} label={i} active={icps.includes(i)} onClick={() => tog(icps, setIcps, i)} />)}</div></div>
              <div><Lbl>Tones</Lbl><div className="flex gap-1.5 flex-wrap">{TONES.map((t) => <MChip key={t} label={t} active={tones.includes(t)} onClick={() => tog(tones, setTones, t)} />)}</div></div>
              <div><Lbl>Hooks</Lbl><div className="flex gap-1.5 flex-wrap">{HOOKS.map((h) => <MChip key={h} label={h} active={hooks.includes(h)} onClick={() => tog(hooks, setHooks, h)} />)}</div></div>
            </div>
            <div><Lbl>Extra Context</Lbl><textarea value={ctx} onChange={(e) => setCtx(e.target.value)} placeholder="Campaign angle, offers..." rows={2} style={{ width: "100%", background: "var(--bg-inset)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "var(--text)", outline: "none", resize: "vertical" }} /></div>
          </MotionDiv>
        )}</AnimatePresence>
        <div className="flex flex-wrap gap-2 justify-end">
          <button onClick={copyPrompt} className="cursor-pointer flex items-center gap-1.5" style={{ color: "#fff", background: "var(--accent)", border: "1px solid var(--accent)", fontWeight: 700, padding: "9px 16px", borderRadius: 10, fontSize: 13, transition: "all 0.15s", boxShadow: "var(--accent-glow)" }}>
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            {copiedKey === "canva" ? "Copied!" : `Copy for Canva (${ac} ads)`}
          </button>
          <button onClick={copyPexelsPrompt} className="cursor-pointer flex items-center gap-1.5" style={{ color: "var(--violet)", background: "var(--violet-bg)", border: "1px solid var(--violet-border)", fontWeight: 700, padding: "9px 16px", borderRadius: 10, fontSize: 13, transition: "all 0.15s" }}>
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            {copiedKey === "pexels" ? "Copied!" : "Pexels + Style"}
          </button>
        </div>
      </Card>
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setShowPreview(showPreview === "canva" ? null : "canva")} className="cursor-pointer" style={{ fontSize: 11, fontWeight: 600, color: showPreview === "canva" ? "var(--accent)" : "var(--text-tertiary)", background: "none", border: "none", padding: 0 }}>{showPreview === "canva" ? "Hide" : "Preview"} Canva prompt</button>
        <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>·</span>
        <button onClick={() => setShowPreview(showPreview === "pexels" ? null : "pexels")} className="cursor-pointer" style={{ fontSize: 11, fontWeight: 600, color: showPreview === "pexels" ? "var(--violet)" : "var(--text-tertiary)", background: "none", border: "none", padding: 0 }}>{showPreview === "pexels" ? "Hide" : "Preview"} Pexels prompt</button>
      </div>
      <AnimatePresence>{showPreview && (
        <MotionDiv initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
          <Card className="overflow-hidden">
            <div style={{ padding: 16, background: "var(--bg-inset)", maxHeight: 480, overflow: "auto" }}>
              <pre style={{ fontSize: 11, color: "var(--text-tertiary)", fontFamily: "monospace", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{previewText}</pre>
            </div>
          </Card>
        </MotionDiv>
      )}</AnimatePresence>
    </div>
  );
}

// ─── Main ───
export default function Home() {
  const { dark, toggle } = useTheme();
  const [tab, setTab] = useState("calendar");
  const [guideOpen, setGuideOpen] = useState(false);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <GuideSidebar open={guideOpen} onClose={() => setGuideOpen(false)} />
      <header className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2"><div style={{ width: 7, height: 7, borderRadius: 99, background: "var(--accent)", boxShadow: "0 0 10px var(--accent-border)" }} /><span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--accent)" }}>Dreambound</span></div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.025em", lineHeight: 1.15 }}>Creative Pipeline</h1>
          <p style={{ fontSize: 13, color: "var(--text-tertiary)", marginTop: 6 }}>AI-powered content briefs and compliant ad copy.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setGuideOpen(true)} className="cursor-pointer" style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 10, padding: "7px 12px", color: "var(--text-secondary)", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, boxShadow: "var(--card-shadow)" }}>
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Guide
          </button>
          <button onClick={toggle} className="cursor-pointer" style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 10, padding: "7px 12px", color: "var(--text-secondary)", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, boxShadow: "var(--card-shadow)" }}>
            {dark ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg> : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>}
            {dark ? "Light" : "Dark"}
          </button>
        </div>
      </header>

      <nav className="flex gap-0.5 mb-7 p-1" style={{ background: "var(--bg-raised)", borderRadius: 12, border: "1px solid var(--border)", width: "fit-content", boxShadow: "var(--card-shadow)" }}>
        {[{ id: "calendar", label: "Content Calendar" }, { id: "ads", label: "Ad Creatives" }, { id: "content-engine", label: "Content Engine" }].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className="cursor-pointer" style={{ padding: "8px 18px", borderRadius: 9, fontSize: 13, fontWeight: 600, border: "none", transition: "all 0.15s", ...(tab === t.id ? { background: "var(--bg-inset)", color: "var(--text)", boxShadow: "0 1px 2px rgba(0,0,0,0.06)" } : { background: "transparent", color: "var(--text-tertiary)" }) }}>{t.label}</button>
        ))}
      </nav>

      <AnimatePresence mode="wait">
        <MotionDiv key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
          {tab === "calendar" ? <ContentEngineTab /> : <PaidAdsTab />}
        </MotionDiv>
      </AnimatePresence>
    </div>
  );
}
