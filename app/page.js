"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const SP = {
  UMA: ["Clinical Medical Assistant", "Healthcare Management", "Healthcare Administration", "Medical Billing and Coding", "Health and Human Services", "Medical Administrative Assistant", "Pharmacy Technician", "Health Information Technology"],
  SNHU: ["Psychology"], AIU: ["Criminal Justice"], CTU: ["Information Technology"],
  FSU: ["Music Production", "Game Development", "Cybersecurity", "Information Technology"],
  CCI: ["Pharmacy Technician", "Radiology", "Medical Billing and Coding", "Medical Assistant"],
  Herzing: ["Sterile Processing Technician"], MedCerts: ["Phlebotomy Technician", "EKG Technician"],
};
const SCHOOLS = Object.keys(SP);
const PLATFORMS = ["Instagram", "Facebook", "TikTok"];
const SIZES = ["4:5", "1:1", "9:16", "16:9"];
const CT = ["Paid", "Organic"];
const ICPS = ["Working Adult", "Career Reset", "Ambition Blocker"];
const TONES = ["Recognition", "Belief", "Awareness"];
const HOOKS = ["Objection Flip", "Stat/Fact", "Day in the Life", "Pain Point", "Transformation", "Curiosity"];
const DR = ["1 Week", "2 Weeks", "1 Month"];
const PC = [3, 5, 7, 10, 14, 20, 30];
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

function Badge({ children, color = "default" }) {
  const c = { default: { bg: "var(--bg-inset)", color: "var(--text-tertiary)", border: "var(--border)" }, orange: { bg: "var(--accent-bg)", color: "var(--accent)", border: "var(--accent-border)" }, green: { bg: "var(--green-bg)", color: "var(--green)", border: "var(--green-border)" }, violet: { bg: "var(--violet-bg)", color: "var(--violet)", border: "var(--violet-border)" } };
  const s = c[color] || c.default;
  return <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 6, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{children}</span>;
}

function Btn({ onClick, disabled, children }) {
  return <button onClick={onClick} disabled={disabled} className="disabled:opacity-40 cursor-pointer flex items-center gap-2" style={{ background: "var(--accent)", color: "#fff", fontWeight: 700, padding: "11px 24px", borderRadius: 12, fontSize: 13, border: "none", boxShadow: "var(--accent-glow)", transition: "all 0.15s", letterSpacing: "0.01em" }}>{children}</button>;
}

function Btn2({ onClick, disabled, children, color = "green" }) {
  const c = { green: { color: "var(--green)", bg: "var(--green-bg)", border: "var(--green-border)" }, violet: { color: "var(--violet)", bg: "var(--violet-bg)", border: "var(--violet-border)" } };
  const s = c[color];
  return <button onClick={onClick} disabled={disabled} className="disabled:opacity-40 cursor-pointer flex items-center gap-1.5" style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}`, fontWeight: 600, padding: "7px 14px", borderRadius: 10, fontSize: 12, transition: "all 0.15s" }}>{children}</button>;
}

function Spinner() { return <span className="spinner" />; }

function Sel({ value, onChange, options }) {
  return <select value={value} onChange={(e) => onChange(e.target.value)} style={{ width: "100%", background: "var(--bg-inset)", border: "1px solid var(--border)", borderRadius: 10, padding: "9px 14px", fontSize: 13, color: "var(--text)", outline: "none", cursor: "pointer" }}>{options.map((o) => <option key={o} value={o}>{o}</option>)}</select>;
}

function SPSelect({ school, program, onS, onP }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div><Lbl>School</Lbl><Sel value={school} onChange={onS} options={SCHOOLS} /></div>
      <div><Lbl>Program</Lbl><Sel value={program} onChange={onP} options={SP[school] || []} /></div>
    </div>
  );
}

function DetailRow({ label, value }) {
  if (!value) return null;
  return <div style={{ padding: "10px 0", borderBottom: "1px solid var(--border-subtle)" }}><div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-tertiary)", marginBottom: 4 }}>{label}</div><div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.65 }}>{value}</div></div>;
}

// ─── Cards ───
function PostCard({ post, i }) {
  const [open, setOpen] = useState(false);
  return (
    <MotionDiv initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.3 }}>
      <Card className="overflow-hidden">
        <div onClick={() => setOpen(!open)} className="cursor-pointer" style={{ padding: "16px 20px", transition: "background 0.1s" }} onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-hover)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap"><span style={{ fontSize: 10, fontFamily: "monospace", color: "var(--text-tertiary)", background: "var(--bg-inset)", padding: "1px 6px", borderRadius: 4 }}>{i + 1}</span><span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{post.post_date}</span><Badge>{post.platform}</Badge><Badge>{post.size}</Badge></div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{post.brief}</p>
            </div>
            <svg className="shrink-0 mt-0.5" style={{ color: "var(--text-tertiary)", transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
        <AnimatePresence>{open && (
          <MotionDiv initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div style={{ padding: "0 20px 16px", borderTop: "1px solid var(--border-subtle)" }}>
              <div style={{ paddingTop: 8 }}><DetailRow label="Required Elements" value={post.required_elements} /><DetailRow label="Hook Archetype" value={post.hook_archetype} /><DetailRow label="ICP" value={post.icp} /><DetailRow label="Tone" value={post.tone} /><DetailRow label="Notes" value={post.notes} /><DetailRow label="Caption" value={post.caption} /><DetailRow label="AI Visual Prompt" value={post.ai_visual_prompt} /><DetailRow label="Extra Notes" value={post.extra_notes} /></div>
            </div>
          </MotionDiv>
        )}</AnimatePresence>
      </Card>
    </MotionDiv>
  );
}

function AdCard({ ad, i }) {
  const [open, setOpen] = useState(false);
  return (
    <MotionDiv initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.3 }}>
      <Card className="overflow-hidden">
        <div onClick={() => setOpen(!open)} className="cursor-pointer" style={{ padding: "16px 20px", transition: "background 0.1s" }} onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-hover)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap"><span style={{ fontSize: 10, fontFamily: "monospace", color: "var(--text-tertiary)", background: "var(--bg-inset)", padding: "1px 6px", borderRadius: 4 }}>{i + 1}</span><Badge color="orange">{ad.hook_format}</Badge><Badge color="violet">{ad.messaging_archetype}</Badge></div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{ad.hook_text}</p>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{ad.subtext}</p>
            </div>
            <svg className="shrink-0 mt-0.5" style={{ color: "var(--text-tertiary)", transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
        <AnimatePresence>{open && (
          <MotionDiv initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div style={{ padding: "0 20px 16px", borderTop: "1px solid var(--border-subtle)" }}>
              <div style={{ paddingTop: 8 }}><DetailRow label="CTA" value={ad.cta} /><DetailRow label="Avatar Type" value={ad.avatar_type} /><DetailRow label="Offer Angle" value={ad.offer_angle} /><DetailRow label="AI Visual Prompt" value={ad.ai_visual_prompt} /><DetailRow label="Compliance" value={ad.compliance_notes} /></div>
            </div>
          </MotionDiv>
        )}</AnimatePresence>
      </Card>
    </MotionDiv>
  );
}

// ─── Guide ───
function Guide({ onDismiss }) {
  const data = [
    { t: "Content Calendar", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", steps: ["Select school and program", "Tap platforms, sizes, ICPs, tones, hooks", "Set date range and post count", "Generate — AI creates compliant briefs", "Expand posts to review all details", "Export CSV for Google Sheets"] },
    { t: "Paid Ads CSV", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", steps: ["Pick school, program, platform, type", "Select ICP targets, tones, archetypes", "Choose number of ads", "Generate compliant ad copy", "Copy CSV to clipboard", "Paste into Claude AI for Canva designs"] },
  ];
  return (
    <MotionDiv initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
      <Card className="mb-8 overflow-hidden">
        <div style={{ padding: "24px 24px 20px" }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5"><div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--accent-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div><span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>Getting Started</span></div>
            <button onClick={onDismiss} className="cursor-pointer" style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", background: "var(--bg-inset)", border: "1px solid var(--border)", borderRadius: 8, padding: "4px 12px" }}>Got it</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.map((s) => (
              <div key={s.t}>
                <div className="flex items-center gap-2 mb-3"><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={s.icon} /></svg><span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.t}</span></div>
                <div className="space-y-2">{s.steps.map((step, j) => (
                  <div key={j} className="flex gap-2.5 items-start">
                    <span style={{ fontSize: 10, fontWeight: 800, color: "var(--accent)", background: "var(--accent-bg)", borderRadius: 5, padding: "1px 6px", minWidth: 20, textAlign: "center", marginTop: 2 }}>{j + 1}</span>
                    <span style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{step}</span>
                  </div>
                ))}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </MotionDiv>
  );
}

// ─── Tabs ───
function CalendarTab() {
  const [school, setSchool] = useState("UMA");
  const [program, setProgram] = useState(SP["UMA"][0]);
  const [plat, setPlat] = useState(["Instagram"]);
  const [ct, setCt] = useState("Organic");
  const [sizes, setSizes] = useState(["4:5"]);
  const [icps, setIcps] = useState(["Working Adult"]);
  const [tones, setTones] = useState(["Belief"]);
  const [hooks, setHooks] = useState(["Transformation"]);
  const [dr, setDr] = useState("1 Week");
  const [pc, setPc] = useState(5);
  const [ctx, setCtx] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const tog = (a, s, v) => s((p) => p.includes(v) ? p.filter((x) => x !== v) : [...p, v]);
  const sc = (s) => { setSchool(s); setProgram(SP[s]?.[0] || ""); };
  const gen = async () => {
    setLoading(true); setPosts([]);
    try {
      const r = await fetch("/api/generate-calendar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ school, program, platforms: plat, creative_type: ct, sizes, icps, tones, hooks, date_range: dr, post_count: pc, extra_context: ctx }) });
      const d = await r.json(); if (d.error) throw new Error(d.error);
      setPosts(d.posts); toast.success(`Generated ${d.posts.length} posts`);
    } catch (e) { toast.error(e.message); } finally { setLoading(false); }
  };
  const exp = async () => {
    setExporting(true);
    try {
      const r = await fetch("/api/export-csv", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ posts, school, program }) });
      const b = await r.blob(); const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = `${program.replace(/\s+/g, "_")}_calendar.csv`; a.click(); URL.revokeObjectURL(u);
      toast.success("CSV downloaded");
    } catch (e) { toast.error(e.message); } finally { setExporting(false); }
  };
  return (
    <div className="space-y-6">
      <Card className="p-5 sm:p-7 space-y-5">
        <SPSelect school={school} program={program} onS={sc} onP={setProgram} />
        <div><Lbl>Creative Type</Lbl><div className="flex gap-2 flex-wrap">{CT.map((t) => <Chip key={t} label={t} active={ct === t} onClick={() => setCt(t)} />)}</div></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div><Lbl>Platforms</Lbl><div className="flex gap-2 flex-wrap">{PLATFORMS.map((p) => <MChip key={p} label={p} active={plat.includes(p)} onClick={() => tog(plat, setPlat, p)} />)}</div></div>
          <div><Lbl>Sizes</Lbl><div className="flex gap-2 flex-wrap">{SIZES.map((s) => <MChip key={s} label={s} active={sizes.includes(s)} onClick={() => tog(sizes, setSizes, s)} />)}</div></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div><Lbl>ICP Targets</Lbl><div className="flex gap-1.5 flex-wrap">{ICPS.map((i) => <MChip key={i} label={i} active={icps.includes(i)} onClick={() => tog(icps, setIcps, i)} />)}</div></div>
          <div><Lbl>Tones</Lbl><div className="flex gap-1.5 flex-wrap">{TONES.map((t) => <MChip key={t} label={t} active={tones.includes(t)} onClick={() => tog(tones, setTones, t)} />)}</div></div>
          <div><Lbl>Hooks</Lbl><div className="flex gap-1.5 flex-wrap">{HOOKS.map((h) => <MChip key={h} label={h} active={hooks.includes(h)} onClick={() => tog(hooks, setHooks, h)} />)}</div></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div><Lbl>Date Range</Lbl><div className="flex gap-2 flex-wrap">{DR.map((d) => <Chip key={d} label={d} active={dr === d} onClick={() => setDr(d)} />)}</div></div>
          <div><Lbl>Posts</Lbl><div className="flex gap-1.5 flex-wrap">{PC.map((n) => <Chip key={n} label={`${n}`} active={pc === n} onClick={() => setPc(n)} />)}</div></div>
        </div>
        <div><Lbl>Extra Context</Lbl><textarea value={ctx} onChange={(e) => setCtx(e.target.value)} placeholder="Campaign theme, direction..." rows={2} style={{ width: "100%", background: "var(--bg-inset)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "var(--text)", outline: "none", resize: "vertical" }} /></div>
        <div className="flex justify-end"><Btn onClick={gen} disabled={loading || !plat.length}>{loading && <Spinner />}{loading ? "Generating..." : `Generate ${pc} Posts`}</Btn></div>
      </Card>
      {posts.length > 0 && (
        <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex items-center justify-between"><div className="flex items-center gap-2.5"><span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>Calendar</span><Badge color="green">{posts.length}</Badge></div>
            <Btn2 onClick={exp} disabled={exporting}>{exporting ? <Spinner /> : <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>}{exporting ? "..." : "Export CSV"}</Btn2></div>
          <div className="space-y-2.5">{posts.map((p, i) => <PostCard key={i} post={p} i={i} />)}</div>
        </MotionDiv>
      )}
    </div>
  );
}

function PaidAdsTab() {
  const [school, setSchool] = useState("UMA");
  const [program, setProgram] = useState(SP["UMA"][0]);
  const [plat, setPlat] = useState("Instagram");
  const [ct, setCt] = useState("Paid");
  const [icps, setIcps] = useState(["Working Adult"]);
  const [tones, setTones] = useState(["Recognition"]);
  const [hooks, setHooks] = useState(["Objection Flip", "Transformation"]);
  const [ac, setAc] = useState(5);
  const [ctx, setCtx] = useState("");
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const tog = (a, s, v) => s((p) => p.includes(v) ? p.filter((x) => x !== v) : [...p, v]);
  const sc = (s) => { setSchool(s); setProgram(SP[s]?.[0] || ""); };
  const gen = async () => {
    setLoading(true); setAds([]);
    try {
      const r = await fetch("/api/generate-ads-csv", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ school, program, platform: plat, creative_type: ct, icps, tones, hooks, ad_count: ac, extra_context: ctx }) });
      const d = await r.json(); if (d.error) throw new Error(d.error);
      setAds(d.ads); toast.success(`Generated ${d.ads.length} ads`);
    } catch (e) { toast.error(e.message); } finally { setLoading(false); }
  };

  // ─── Build the smart prompt file for Claude Chat + Canva MCP ───
  const DEGREE_SCHOOLS = ["UMA", "SNHU", "AIU", "CTU", "FSU"];
  const buildPrompt = () => {
    if (!ads.length) return "";
    const isDegree = DEGREE_SCHOOLS.includes(school);
    const dims = { Instagram: "1080x1350 (4:5)", Facebook: "1080x1080 (1:1)", TikTok: "1080x1920 (9:16)" };
    const dim = dims[plat] || "1080x1350";

    let prompt = `# Dreambound Canva Design Job
## STEP 0: Verify Canva MCP Connection
Before doing anything else, confirm you have access to Canva MCP tools. Try listing your available tools and verify you can see: generate_design, perform_editing_operations, create_folder, move_item_to_folder, and get_design.

If you do NOT have Canva connected:
- Tell me "Canva MCP is not connected. Please enable it in your MCP settings first."
- Stop here. Do not proceed.

If you DO have Canva connected, say "Canva MCP verified." and proceed to Step 1.

---

## STEP 1: Create Folder
Create a Canva folder named: "${school} - ${program} - ${plat} ${ct} Ads"
Save the folder ID for organizing designs later.

---

## STEP 2: Generate Designs
Process each ad below ONE AT A TIME. For each ad:
1. Use generate_design with the AI Visual Prompt below. Target size: ${dim}. Make it a ${plat} ${ct.toLowerCase()} ad.
2. Use perform_editing_operations to add the text elements:
   - Hook Text as the primary headline (large, bold, high contrast)
   - Subtext as supporting body copy (smaller, below headline)
   - CTA as button or bottom banner text (clear, actionable)
3. Use move_item_to_folder to put the design in the folder from Step 1.
4. Report the design URL before moving to the next ad.

COMPLIANCE RULES (CRITICAL):
- Dreambound is the ONLY brand name. NEVER put "${school}" or any school name in the design.
- No employment guarantees, outcome promises, or job placement language.
- No "guarantee", "free", "dream career", "Fast Track".
${isDegree ? `- This is a DEGREE program: use "study" and "education" only. Never "train"/"training".` : `- This is a CERTIFICATE program: "training" is acceptable.${school === "CCI" ? " Urgency language is OK." : ""}`}
${school === "FSU" ? '- FSU financial aid line: "Financial Aid is available for those who qualify." (exact wording)' : ""}
${school === "AIU" || school === "CTU" ? `- ${school}: No urgency language. Include "Completion times vary according to the individual student."` : ""}

---

## ADS TO GENERATE (${ads.length} total)
`;

    ads.forEach((ad, i) => {
      prompt += `
### Ad ${i + 1} of ${ads.length}
- **Hook Format:** ${ad.hook_format}
- **Messaging Archetype:** ${ad.messaging_archetype}
- **Hook Text:** ${ad.hook_text}
- **Subtext:** ${ad.subtext}
- **CTA:** ${ad.cta}
- **AI Visual Prompt:** ${ad.ai_visual_prompt}
`;
    });

    prompt += `
---

## STEP 3: Summary
After all ${ads.length} designs are generated, provide a summary table:
| Ad # | Hook Text (first 30 chars) | Design URL | Status |
|------|---------------------------|------------|--------|

Then confirm: "All ${ads.length} designs generated and organized in the '${school} - ${program} - ${plat} ${ct} Ads' folder."
`;

    return prompt;
  };

  const csv = () => {
    if (!ads.length) return "";
    const h = "Program,Hook Format,Messaging Archetype,Avatar Type,Offer Angle,Hook Text,Subtext,CTA,AI Visual Prompt";
    const rows = ads.map((a) => [program, a.hook_format, a.messaging_archetype, a.avatar_type, a.offer_angle, a.hook_text, a.subtext, a.cta, a.ai_visual_prompt].map((v) => `"${(v || "").replace(/"/g, '""')}"`).join(","));
    return [h, ...rows].join("\n");
  };
  const copyPrompt = () => { navigator.clipboard.writeText(buildPrompt()); setCopied(true); toast.success("Canva prompt copied — paste into Claude Chat"); setTimeout(() => setCopied(false), 2500); };
  const dlPrompt = () => { const b = new Blob([buildPrompt()], { type: "text/markdown" }); const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = `${school}_${program.replace(/\s+/g, "_")}_canva_job.md`; a.click(); URL.revokeObjectURL(u); toast.success("Prompt file downloaded"); };
  const dlCsv = () => { const b = new Blob([csv()], { type: "text/csv" }); const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = `${school}_${program.replace(/\s+/g, "_")}_ads.csv`; a.click(); URL.revokeObjectURL(u); toast.success("CSV downloaded"); };
  return (
    <div className="space-y-6">
      <Card className="p-5 sm:p-7 space-y-5">
        <SPSelect school={school} program={program} onS={sc} onP={setProgram} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div><Lbl>Platform</Lbl><div className="flex gap-2 flex-wrap">{PLATFORMS.map((p) => <Chip key={p} label={p} active={plat === p} onClick={() => setPlat(p)} />)}</div></div>
          <div><Lbl>Creative Type</Lbl><div className="flex gap-2 flex-wrap">{CT.map((t) => <Chip key={t} label={t} active={ct === t} onClick={() => setCt(t)} />)}</div></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div><Lbl>ICPs</Lbl><div className="flex gap-1.5 flex-wrap">{ICPS.map((i) => <MChip key={i} label={i} active={icps.includes(i)} onClick={() => tog(icps, setIcps, i)} />)}</div></div>
          <div><Lbl>Tones</Lbl><div className="flex gap-1.5 flex-wrap">{TONES.map((t) => <MChip key={t} label={t} active={tones.includes(t)} onClick={() => tog(tones, setTones, t)} />)}</div></div>
          <div><Lbl>Hooks</Lbl><div className="flex gap-1.5 flex-wrap">{HOOKS.map((h) => <MChip key={h} label={h} active={hooks.includes(h)} onClick={() => tog(hooks, setHooks, h)} />)}</div></div>
        </div>
        <div><Lbl>Number of Ads</Lbl><div className="flex gap-1.5 flex-wrap">{AC.map((n) => <Chip key={n} label={`${n}`} active={ac === n} onClick={() => setAc(n)} />)}</div></div>
        <div><Lbl>Extra Context</Lbl><textarea value={ctx} onChange={(e) => setCtx(e.target.value)} placeholder="Campaign angle, offers..." rows={2} style={{ width: "100%", background: "var(--bg-inset)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "var(--text)", outline: "none", resize: "vertical" }} /></div>
        <div className="flex justify-end"><Btn onClick={gen} disabled={loading}>{loading && <Spinner />}{loading ? "Generating..." : `Generate ${ac} Ads`}</Btn></div>
      </Card>
      {ads.length > 0 && (
        <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5"><span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>Ad Creatives</span><Badge color="orange">{ads.length}</Badge></div>
            <div className="flex gap-2">
              <button onClick={copyPrompt} className="cursor-pointer flex items-center gap-1.5" style={{ color: "#fff", background: "var(--accent)", border: "1px solid var(--accent)", fontWeight: 700, padding: "7px 14px", borderRadius: 10, fontSize: 12, transition: "all 0.15s", boxShadow: "var(--accent-glow)" }}><svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>{copied ? "Copied!" : "Copy for Claude Chat"}</button>
              <Btn2 onClick={dlPrompt} color="violet"><svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>Download .md</Btn2>
              <Btn2 onClick={dlCsv}><svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>CSV</Btn2>
            </div>
          </div>
          <Card className="overflow-hidden">
            <div style={{ padding: 16, overflowX: "auto", background: "var(--bg-inset)", borderRadius: "15px 15px 0 0", maxHeight: 300, overflow: "auto" }}><pre style={{ fontSize: 11, color: "var(--text-tertiary)", fontFamily: "monospace", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{buildPrompt()}</pre></div>
            <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border-subtle)", background: "var(--accent-bg)" }}><p style={{ fontSize: 11, color: "var(--accent)" }}>Copy this and paste into Claude Chat (claude.ai) with Canva MCP enabled. It will verify Canva is connected, then generate all {ads.length} designs automatically.</p></div>
          </Card>
          <div className="space-y-2.5">{ads.map((ad, i) => <AdCard key={i} ad={ad} i={i} />)}</div>
        </MotionDiv>
      )}
    </div>
  );
}

// ─── Main ───
export default function Home() {
  const { dark, toggle } = useTheme();
  const [tab, setTab] = useState("calendar");
  const [guide, setGuide] = useState(true);
  useEffect(() => { try { if (localStorage.getItem("guide_dismissed")) setGuide(false); } catch {} }, []);
  const dismiss = () => { setGuide(false); try { localStorage.setItem("guide_dismissed", "1"); } catch {} };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2"><div style={{ width: 7, height: 7, borderRadius: 99, background: "var(--accent)", boxShadow: "0 0 10px var(--accent-border)" }} /><span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--accent)" }}>Dreambound</span></div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.025em", lineHeight: 1.15 }}>Creative Pipeline</h1>
          <p style={{ fontSize: 13, color: "var(--text-tertiary)", marginTop: 6 }}>AI-powered content briefs and compliant ad copy.</p>
        </div>
        <button onClick={toggle} className="cursor-pointer" style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 10, padding: "7px 12px", color: "var(--text-secondary)", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, boxShadow: "var(--card-shadow)" }}>
          {dark ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg> : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>}
          {dark ? "Light" : "Dark"}
        </button>
      </header>

      <AnimatePresence>{guide && <Guide onDismiss={dismiss} />}</AnimatePresence>

      <nav className="flex gap-0.5 mb-7 p-1" style={{ background: "var(--bg-raised)", borderRadius: 12, border: "1px solid var(--border)", width: "fit-content", boxShadow: "var(--card-shadow)" }}>
        {[{ id: "calendar", label: "Content Calendar" }, { id: "ads", label: "Paid Ads CSV" }].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className="cursor-pointer" style={{ padding: "8px 18px", borderRadius: 9, fontSize: 13, fontWeight: 600, border: "none", transition: "all 0.15s", ...(tab === t.id ? { background: "var(--bg-inset)", color: "var(--text)", boxShadow: "0 1px 2px rgba(0,0,0,0.06)" } : { background: "transparent", color: "var(--text-tertiary)" }) }}>{t.label}</button>
        ))}
      </nav>

      <AnimatePresence mode="wait">
        <MotionDiv key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
          {tab === "calendar" ? <CalendarTab /> : <PaidAdsTab />}
        </MotionDiv>
      </AnimatePresence>
    </div>
  );
}
