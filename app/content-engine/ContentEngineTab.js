"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// ─── School/Program mapping ───
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

// ─── Bucket definitions ───
const TRACK_A_BUCKETS = [
  { letter: "A", anchor: "Despair", label: "Internal Conflict", color: "red" },
  { letter: "B", anchor: "Despair", label: "Effort-Reality Gap", color: "red" },
  { letter: "C", anchor: "Hope", label: "Emotional Validation", color: "green" },
  { letter: "D", anchor: "Hope", label: "Motivational Reframing", color: "green" },
  { letter: "E", anchor: "Bridge", label: "Private Desire", color: "violet" },
  { letter: "F", anchor: "Bridge", label: "Possible Paths Exist", color: "violet" },
];
const TRACK_B_BUCKETS = [
  { letter: "G", anchor: "Community", label: "Relatable Vent", color: "orange" },
  { letter: "H", anchor: "Community", label: "Unpopular Opinion", color: "orange" },
  { letter: "I", anchor: "Community", label: "Hype-Up", color: "orange" },
];

const FORMAT_OPTIONS = ["Image", "Video", "Carousel"];

// ─── Primitives (matching main app) ───
const MotionDiv = motion.div;
function Card({ children, className = "" }) { return <div className={className} style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 16, boxShadow: "var(--card-shadow)" }}>{children}</div>; }
function Lbl({ children }) { return <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-tertiary)", marginBottom: 8 }}>{children}</div>; }
function Chip({ label, active, onClick }) { return <button onClick={onClick} className="relative cursor-pointer" style={{ padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600, border: "1px solid transparent", transition: "all 0.2s", ...(active ? { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)", boxShadow: "var(--accent-glow)" } : { background: "var(--bg-inset)", color: "var(--text-secondary)", borderColor: "var(--border)" }) }}>{label}</button>; }
function MChip({ label, active, onClick }) { return <button onClick={onClick} className="cursor-pointer flex items-center gap-1.5" style={{ padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 500, transition: "all 0.2s", ...(active ? { background: "var(--accent-bg)", color: "var(--accent)", border: "1px solid var(--accent-border)" } : { background: "var(--bg-inset)", color: "var(--text-tertiary)", border: "1px solid var(--border)" }) }}>{active && <span style={{ width: 5, height: 5, borderRadius: 99, background: "var(--accent)" }} />}{label}</button>; }
function Btn({ onClick, disabled, children }) { return <button onClick={onClick} disabled={disabled} className="disabled:opacity-40 cursor-pointer flex items-center gap-2" style={{ background: "var(--accent)", color: "#fff", fontWeight: 700, padding: "11px 24px", borderRadius: 12, fontSize: 13, border: "none", boxShadow: "var(--accent-glow)", transition: "all 0.15s", letterSpacing: "0.01em" }}>{children}</button>; }
function Sel({ value, onChange, options }) { return <select value={value} onChange={(e) => onChange(e.target.value)} style={{ width: "100%", background: "var(--bg-inset)", border: "1px solid var(--border)", borderRadius: 10, padding: "9px 14px", fontSize: 13, color: "var(--text)", outline: "none", cursor: "pointer" }}>{options.map((o) => <option key={o} value={o}>{o}</option>)}</select>; }

// ─── Step Header ───
function StepHeader({ number, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--accent-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "var(--accent)", flexShrink: 0 }}>{number}</div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 1 }}>{subtitle}</div>}
      </div>
    </div>
  );
}

// ─── DatePicker ───
function DatePicker({ dates, onChange, mode, onModeChange, dateRange, onDateRangeChange }) {
  const addDate = (e) => { const v = e.target.value; if (v && !dates.includes(v)) onChange([...dates, v].sort()); e.target.value = ""; };
  const remove = (d) => onChange(dates.filter((x) => x !== d));
  const fmt = (d) => { const dt = new Date(d + "T00:00:00"); return dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }); };
  const today = new Date().toISOString().split("T")[0];
  const dateInputStyle = { width: "100%", background: "var(--bg-inset)", border: "1px solid var(--border)", borderRadius: 10, padding: "9px 14px", fontSize: 13, color: "var(--text)", outline: "none", cursor: "pointer" };
  return (
    <div>
      <div className="flex gap-1.5 mb-2">
        <Chip label="Pick Dates" active={mode === "dates"} onClick={() => onModeChange("dates")} />
        <Chip label="Date Range" active={mode === "range"} onClick={() => onModeChange("range")} />
      </div>
      {mode === "range" ? (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginBottom: 4, fontWeight: 600 }}>Start</div>
            <input type="date" min={today} value={dateRange.start || ""} onClick={(e) => e.target.showPicker?.()} onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })} style={dateInputStyle} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginBottom: 4, fontWeight: 600 }}>End</div>
            <input type="date" min={dateRange.start || today} value={dateRange.end || ""} onClick={(e) => e.target.showPicker?.()} onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })} style={dateInputStyle} />
          </div>
        </div>
      ) : (
        <>
          <input type="date" min={today} onChange={addDate} onClick={(e) => e.target.showPicker?.()} style={dateInputStyle} />
          {dates.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {dates.map((d) => (
                <span key={d} className="flex items-center gap-1" style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 7, background: "var(--accent-bg)", color: "var(--accent)", border: "1px solid var(--accent-border)" }}>
                  {fmt(d)}
                  <button onClick={() => remove(d)} className="cursor-pointer" style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 13, lineHeight: 1, padding: 0 }}>&times;</button>
                </span>
              ))}
              {dates.length > 1 && <button onClick={() => onChange([])} className="cursor-pointer" style={{ fontSize: 10, fontWeight: 600, color: "var(--text-tertiary)", background: "none", border: "none", padding: "3px 6px" }}>Clear all</button>}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Bucket Quantity Row ───
function BucketRow({ bucket, count, onChange }) {
  const colorMap = { red: "var(--red)", green: "var(--green)", violet: "var(--violet)", orange: "var(--accent)" };
  const bgMap = { red: "var(--red-bg)", green: "var(--green-bg)", violet: "var(--violet-bg)", orange: "var(--accent-bg)" };
  return (
    <div className="flex items-center gap-3" style={{ padding: "8px 0" }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: bgMap[bucket.color], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: colorMap[bucket.color], flexShrink: 0 }}>{bucket.letter}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{bucket.label}</div>
        <div style={{ fontSize: 10, color: "var(--text-tertiary)" }}>{bucket.anchor}</div>
      </div>
      <div className="flex items-center gap-1.5">
        <button onClick={() => onChange(Math.max(0, count - 1))} className="cursor-pointer" style={{ width: 26, height: 26, borderRadius: 6, background: "var(--bg-inset)", border: "1px solid var(--border)", color: "var(--text-secondary)", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
        <div style={{ width: 32, textAlign: "center", fontSize: 14, fontWeight: 700, color: count > 0 ? "var(--text)" : "var(--text-tertiary)" }}>{count}</div>
        <button onClick={() => onChange(Math.min(10, count + 1))} className="cursor-pointer" style={{ width: 26, height: 26, borderRadius: 6, background: "var(--bg-inset)", border: "1px solid var(--border)", color: "var(--text-secondary)", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
      </div>
    </div>
  );
}

// ─── Build the prompt for Claude.ai ───
const DEGREE_SCHOOLS = ["UMA", "SNHU", "AIU", "CTU", "FSU"];
const TRACK_DESCRIPTION = `THE "SELLING TO FEELING" FRAMEWORK
ABSOLUTE RULE: One anchor per creative, one bucket per post. Despair and Hope must NEVER be mixed in the same post.

TRACK A: Program-Specific (Conversion)
- Anchor 1: DESPAIR
  • Bucket A — Internal Conflict: Self-doubt, imposter syndrome, fear of change.
  • Bucket B — Effort-Reality Gap: Working hard but getting nowhere.
- Anchor 2: HOPE
  • Bucket C — Emotional Validation: Make the reader feel seen and understood.
  • Bucket D — Motivational Reframing: Reframe stuck as starting.
- Anchor 3: BRIDGE
  • Bucket E — Private Desire: Quiet ambitions people don't say out loud.
  • Bucket F — Possible Paths Exist: Plant seeds of possibility without hard-selling.

TRACK B: Non-Programmatic (Community/Shareability) — Ignore programs entirely.
- Bucket G — Relatable Vent: Humor about universal work struggles.
- Bucket H — Unpopular Opinion: Hot takes on workplace/hustle culture.
- Bucket I — Hype-Up: Quotable inspiration about refusing to settle.`;

function buildComplianceBlock(school, program) {
  if (!school) return "";
  const isDegree = DEGREE_SCHOOLS.includes(school);
  const lines = [
    `COMPLIANCE RULES`,
    `- School: ${school} | Program: ${program}`,
    `- Dreambound is the ONLY public brand. Never mention school names in copy.`,
    `- No employment guarantees, outcome promises, or job placement language.`,
    `- No "guarantee", "free", "dream career", "Fast Track".`,
    isDegree
      ? `- Degree program: use "study" and "education" only. Never "train"/"training". "Career" must pair with "path" or "journey".`
      : `- Certificate program: "training" is acceptable.${school === "CCI" ? " Urgency language is OK." : ""}`,
  ];
  if (school === "FSU") lines.push(`- Financial aid line: "Financial Aid is available for those who qualify."`);
  else lines.push(`- Financial aid line: "Financial aid may be available for those who qualify."`);
  if (school === "AIU" || school === "CTU") lines.push(`- No urgency language. Always include: "Completion times vary according to the individual student."`);
  return lines.join("\n");
}

function buildContentPrompt({ trackMode, school, program, buckets, brief, dates, dateMode, dateRange, platforms, formatMix }) {
  const totalPosts = Object.values(buckets).reduce((sum, n) => sum + n, 0);
  const bucketBreakdown = Object.entries(buckets)
    .filter(([, count]) => count > 0)
    .map(([letter, count]) => `- Bucket ${letter}: ${count} post(s)`)
    .join("\n");

  let dateInstruction = "";
  if (dateMode === "dates" && dates?.length) {
    dateInstruction = `Distribute posts across these exact dates: ${dates.join(", ")}`;
  } else if (dateMode === "range" && dateRange?.start && dateRange?.end) {
    dateInstruction = `Distribute posts evenly from ${dateRange.start} to ${dateRange.end}`;
  }

  let formatInstruction;
  if (formatMix && Object.values(formatMix).some((v) => v > 0)) {
    const parts = Object.entries(formatMix)
      .filter(([, count]) => count > 0)
      .map(([fmt, count]) => `${count} ${fmt}`)
      .join(", ");
    formatInstruction = `Content format distribution: ${parts}. Assign formats to posts accordingly.`;
  } else {
    formatInstruction = `Assign content formats to each post. Default to "Image (4:5)" for image posts and "Video (9:16)" for video posts. Mix both image and video formats for variety.`;
  }

  const programLine =
    trackMode !== "B" && school && program
      ? `Program Context: ${school} — ${program}\nWeave the program/field into Track A copy naturally without naming the school directly.`
      : "";
  const briefLine = brief ? `Creative Brief / Direction:\n${brief}` : "";
  const compliance = trackMode !== "B" ? buildComplianceBlock(school, program) : "";

  return `# Dreambound Content Calendar — Generate ${totalPosts} Posts
You are an expert social media copywriter and content calendar strategist for Dreambound, an education marketing brand. You operate under the "Selling to Feeling" framework. Your job is to generate a full organic content calendar with copy already written for each post.

═══════════════════════════════════════════
${TRACK_DESCRIPTION}
═══════════════════════════════════════════
${compliance ? `\n${compliance}\n` : ""}
OUTPUT FORMAT:
Return a markdown table with these columns: Post Date, Platform, Content Format, Content Track, Bucket, Post Brief, Visual Hook, Caption, Notes.

BUCKET FULL NAMES (use these exact labels):
- A — Internal Conflict
- B — Effort-Reality Gap
- C — Emotional Validation
- D — Motivational Reframing
- E — Private Desire
- F — Possible Paths Exist
- G — Relatable Vent
- H — Unpopular Opinion
- I — Hype-Up

RULES:
- Each post uses ONE anchor and ONE bucket only.
- Despair buckets (A, B) and Hope buckets (C, D) must NEVER be mixed in the same post.
- Bridge buckets (E, F) lean hopeful but not overtly promotional.
- Track B posts (G, H, I) must never mention any school, program, or educational offering.

VISUAL HOOK (most important field — the visual IS the hook in social media):
- We do NOT shoot talking-head or selfie-cam videos. Our creative style is TEXT ON B-ROLL.
- All videos use thematic B-roll footage (stock, cinematic, trending) with bold text overlays.
- Be EXTREMELY specific. Describe the B-roll scene (setting, movement, mood, color grade, lighting), the exact text overlay (wording, font style, placement, animation), and how they work together to stop the scroll in the first 1-3 seconds.
- For images: describe composition, focal point, text placement, font style, and visual contrast.
- NEVER suggest talking-head, direct-to-camera, or selfie-style content.

CAPTION (keep it SHORT — social media users don't read essays):
- Hook line: punchy, scroll-stopping, under 15 words.
- Body: 1-2 SHORT sentences max.
- CTA: one clear line.
- Total caption should feel like a text from a friend, not a blog post.

═══════════════════════════════════════════
JOB PARAMETERS
═══════════════════════════════════════════

Generate exactly ${totalPosts} organic social media posts.

BUCKET DISTRIBUTION (follow exactly):
${bucketBreakdown}

${dateInstruction}
Platforms to use: ${platforms.join(", ")}
${formatInstruction}
${programLine}
${briefLine}

Each post must strictly follow its assigned bucket's emotional directive. Vary hooks, angles, visual suggestions, and formats across posts for maximum content diversity.`;
}

// ─── Main Wizard Component ───
export default function ContentEngineTab() {
  // Step 1: Brief
  const [brief, setBrief] = useState("");
  // Step 2: Schedule
  const [platforms, setPlatforms] = useState(["Instagram"]);
  const [dateMode, setDateMode] = useState("dates");
  const [dates, setDates] = useState([]);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  // Step 3: Program
  const [school, setSchool] = useState("General");
  const [program, setProgram] = useState(SP["General"][0]);
  // Step 4: Format Mix
  const [formatCounts, setFormatCounts] = useState({ Image: 0, Video: 0, Carousel: 0 });
  // Step 5: Content Engine
  const [trackMode, setTrackMode] = useState("mixed");
  const [bucketCounts, setBucketCounts] = useState({ A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, I: 0 });
  // Output
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const tog = (arr, setter, val) => setter((p) => p.includes(val) ? p.filter((x) => x !== val) : [...p, val]);
  const schoolChange = (s) => { setSchool(s); setProgram(SP[s]?.[0] || ""); };

  const totalBucketCount = () => {
    const active = trackMode === "A" ? ["A","B","C","D","E","F"] : trackMode === "B" ? ["G","H","I"] : ["A","B","C","D","E","F","G","H","I"];
    return active.reduce((sum, l) => sum + (bucketCounts[l] || 0), 0);
  };
  const activeBuckets = trackMode === "A" ? TRACK_A_BUCKETS : trackMode === "B" ? TRACK_B_BUCKETS : [...TRACK_A_BUCKETS, ...TRACK_B_BUCKETS];

  const promptParams = () => {
    const activeBucketLetters = trackMode === "A" ? ["A","B","C","D","E","F"] : trackMode === "B" ? ["G","H","I"] : ["A","B","C","D","E","F","G","H","I"];
    const filteredBuckets = {};
    for (const l of activeBucketLetters) { if (bucketCounts[l] > 0) filteredBuckets[l] = bucketCounts[l]; }
    return {
      trackMode, school, program,
      buckets: filteredBuckets,
      brief: brief.trim(),
      dates, dateMode, dateRange, platforms,
      formatMix: Object.values(formatCounts).some((v) => v > 0) ? formatCounts : null,
    };
  };

  // Validation
  const hasDates = dateMode === "dates" ? dates.length > 0 : (dateRange.start && dateRange.end);
  const hasBrief = brief.trim().length > 0;
  const canCopy = hasBrief && hasDates && platforms.length > 0 && totalBucketCount() > 0;

  const copyPrompt = () => {
    if (!canCopy) return;
    navigator.clipboard.writeText(buildContentPrompt(promptParams()));
    setCopied(true);
    toast.success("Prompt copied — paste into Claude.ai");
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-5">

      {/* ─── Step 1: Brief ─── */}
      <Card>
        <div style={{ padding: 24 }} className="space-y-4">
          <StepHeader number={1} title="Creative Brief" subtitle="Describe the campaign direction, tone, or anything Claude should know." />
          <div>
            <Lbl>Creative Brief / Direction</Lbl>
            <textarea value={brief} onChange={(e) => setBrief(e.target.value)} placeholder="e.g. Q3 push for working adults considering a career change. Lean hopeful, lots of relatable mid-week venting." rows={3}
              style={{ width: "100%", background: "var(--bg-inset)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "var(--text)", outline: "none", resize: "vertical", fontFamily: "'Inter', system-ui, sans-serif" }} />
          </div>
        </div>
      </Card>

      {/* ─── Step 2: Schedule & Platforms ─── */}
      <Card>
        <div style={{ padding: 24 }} className="space-y-4">
          <StepHeader number={2} title="Schedule & Platforms" subtitle="When and where to post." />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Lbl>Dates</Lbl><DatePicker dates={dates} onChange={setDates} mode={dateMode} onModeChange={setDateMode} dateRange={dateRange} onDateRangeChange={setDateRange} /></div>
            <div><Lbl>Platforms</Lbl><div className="flex gap-1.5 flex-wrap">{PLATFORMS.map((p) => <MChip key={p} label={p} active={platforms.includes(p)} onClick={() => tog(platforms, setPlatforms, p)} />)}</div></div>
          </div>
        </div>
      </Card>

      {/* ─── Step 3: School & Program ─── */}
      <Card>
        <div style={{ padding: 24 }} className="space-y-4">
          <StepHeader number={3} title="School & Program" subtitle="Used for compliance and program-specific copy." />
          <div className="grid grid-cols-2 gap-3">
            <div><Lbl>School</Lbl><Sel value={school} onChange={schoolChange} options={SCHOOLS} /></div>
            <div><Lbl>{school === "General" ? "Focus" : "Program"}</Lbl><Sel value={program} onChange={setProgram} options={SP[school] || []} /></div>
          </div>
        </div>
      </Card>

      {/* ─── Step 4: Content Format (Optional) ─── */}
      <Card>
        <div style={{ padding: 24 }} className="space-y-4">
          <StepHeader number={4} title="Content Format" subtitle="Optional. Skip to let AI assign (defaults: Image 4:5, Video 9:16)." />
          <div className="grid grid-cols-3 gap-4">
            {FORMAT_OPTIONS.map((fmt) => (
              <div key={fmt}>
                <Lbl>{fmt}</Lbl>
                <div className="flex items-center gap-2">
                  <button onClick={() => setFormatCounts((p) => ({ ...p, [fmt]: Math.max(0, p[fmt] - 1) }))} className="cursor-pointer" style={{ width: 28, height: 28, borderRadius: 6, background: "var(--bg-inset)", border: "1px solid var(--border)", color: "var(--text-secondary)", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                  <div style={{ width: 36, textAlign: "center", fontSize: 15, fontWeight: 700, color: formatCounts[fmt] > 0 ? "var(--text)" : "var(--text-tertiary)" }}>{formatCounts[fmt]}</div>
                  <button onClick={() => setFormatCounts((p) => ({ ...p, [fmt]: Math.min(20, p[fmt] + 1) }))} className="cursor-pointer" style={{ width: 28, height: 28, borderRadius: 6, background: "var(--bg-inset)", border: "1px solid var(--border)", color: "var(--text-secondary)", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                </div>
              </div>
            ))}
          </div>
          {Object.values(formatCounts).every((v) => v === 0) && (
            <p style={{ fontSize: 11, color: "var(--text-tertiary)", fontStyle: "italic" }}>No formats specified — AI will auto-assign with Image (4:5) and Video (9:16) defaults.</p>
          )}
        </div>
      </Card>

      {/* ─── Step 5: Content Engine ─── */}
      <Card>
        <div style={{ padding: 24 }} className="space-y-4">
          <StepHeader number={5} title="Content Engine" subtitle="The Selling to Feeling framework drives content diversity." />
          <div>
            <Lbl>Content Track</Lbl>
            <div className="flex gap-1.5 flex-wrap">
              <Chip label="Track A — Conversion" active={trackMode === "A"} onClick={() => setTrackMode("A")} />
              <Chip label="Track B — Community" active={trackMode === "B"} onClick={() => setTrackMode("B")} />
              <Chip label="Mixed Batch" active={trackMode === "mixed"} onClick={() => setTrackMode("mixed")} />
            </div>
          </div>
          <div>
            <Lbl>Posts per Bucket</Lbl>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
              {activeBuckets.map((bucket) => (
                <BucketRow key={bucket.letter} bucket={bucket} count={bucketCounts[bucket.letter] || 0} onChange={(n) => setBucketCounts((p) => ({ ...p, [bucket.letter]: n }))} />
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* ─── Copy Prompt Button ─── */}
      <div className="flex items-center gap-4 flex-wrap">
        <Btn onClick={copyPrompt} disabled={!canCopy}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          {copied ? "Copied!" : "Copy Prompt for Claude"}
        </Btn>
        <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
          {totalBucketCount()} post{totalBucketCount() !== 1 ? "s" : ""} queued
          {!canCopy && <span style={{ color: "var(--red)", marginLeft: 8 }}>
            {!hasBrief ? "— add a brief" : !hasDates ? "— add dates" : platforms.length === 0 ? "— select platforms" : totalBucketCount() === 0 ? "— set bucket quantities" : ""}
          </span>}
        </span>
      </div>

      {/* ─── Prompt preview ─── */}
      {canCopy && (
        <Card className="overflow-hidden">
          <button onClick={() => setShowPreview(!showPreview)} className="cursor-pointer w-full flex items-center justify-between" style={{ padding: "10px 16px", background: "var(--accent-bg)", border: "none" }}>
            <p style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600 }}>Paste into Claude.ai to generate {totalBucketCount()} post{totalBucketCount() !== 1 ? "s" : ""}</p>
            <svg style={{ color: "var(--accent)", transform: showPreview ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>
          <AnimatePresence>{showPreview && (
            <MotionDiv initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              <div style={{ padding: 16, background: "var(--bg-inset)", maxHeight: 400, overflow: "auto" }}>
                <pre style={{ fontSize: 11, color: "var(--text-tertiary)", fontFamily: "monospace", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{buildContentPrompt(promptParams())}</pre>
              </div>
            </MotionDiv>
          )}</AnimatePresence>
        </Card>
      )}
    </div>
  );
}
