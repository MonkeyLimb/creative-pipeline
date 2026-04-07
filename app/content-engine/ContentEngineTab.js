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
function Btn2({ onClick, disabled, children, color = "green" }) { const c = { green: { color: "var(--green)", bg: "var(--green-bg)", border: "var(--green-border)" }, violet: { color: "var(--violet)", bg: "var(--violet-bg)", border: "var(--violet-border)" } }; const s = c[color]; return <button onClick={onClick} disabled={disabled} className="disabled:opacity-40 cursor-pointer flex items-center gap-1.5" style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}`, fontWeight: 600, padding: "7px 14px", borderRadius: 10, fontSize: 12, transition: "all 0.15s" }}>{children}</button>; }
function Spinner() { return <span className="spinner" />; }
function Sel({ value, onChange, options }) { return <select value={value} onChange={(e) => onChange(e.target.value)} style={{ width: "100%", background: "var(--bg-inset)", border: "1px solid var(--border)", borderRadius: 10, padding: "9px 14px", fontSize: 13, color: "var(--text)", outline: "none", cursor: "pointer" }}>{options.map((o) => <option key={o} value={o}>{o}</option>)}</select>; }
function Badge({ children, color = "default" }) { const c = { default: { bg: "var(--bg-inset)", color: "var(--text-tertiary)", border: "var(--border)" }, orange: { bg: "var(--accent-bg)", color: "var(--accent)", border: "var(--accent-border)" }, green: { bg: "var(--green-bg)", color: "var(--green)", border: "var(--green-border)" }, violet: { bg: "var(--violet-bg)", color: "var(--violet)", border: "var(--violet-border)" }, red: { bg: "var(--red-bg)", color: "var(--red)", border: "var(--red-border)" } }; const s = c[color] || c.default; return <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 6, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{children}</span>; }

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

// ─── CSV helpers ───
function escapeCSV(val) {
  if (!val) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) return `"${str.replace(/"/g, '""')}"`;
  return str;
}
const POST_KEYS = ["post_date", "platform", "content_format", "content_track", "bucket", "post_brief", "visual_hook", "caption", "notes"];

function buildCsvString(posts) {
  const lines = [];
  lines.push(",,,,Links to final output");
  for (let i = 0; i < posts.length; i++) {
    const p = posts[i];
    if (i > 0) { lines.push(",,,,"); lines.push(",,,,"); }
    lines.push(`Post ${i + 1},,,,`);
    lines.push(`,Post Date,${escapeCSV(p.post_date)},,`);
    lines.push(`,Platform,${escapeCSV(p.platform)},,`);
    lines.push(`,Content Track,${escapeCSV(p.content_track)},,`);
    lines.push(`,Bucket,${escapeCSV(p.bucket)},,`);
    lines.push(`,Content Format,${escapeCSV(p.content_format)},,`);
    lines.push(`,Post Brief (Description),${escapeCSV(p.post_brief)},,`);
    lines.push(`,Visual Hook (Required in Post),${escapeCSV(p.visual_hook)},,`);
    lines.push(`,Notes,${escapeCSV(p.notes)},,`);
    lines.push(`,Inspiration,,,`);
    lines.push(`,Versions,,,`);
    lines.push(`,Caption,${escapeCSV(p.caption)},,`);
    lines.push(`,Extra Notes,,,`);
  }
  return lines.join("\n");
}
function downloadCSV(posts, school, program) {
  const csv = buildCsvString(posts);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${school}_${program.replace(/\s+/g, "_")}_content_calendar.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Editable Data Table ───
function EditableTable({ posts, onChange }) {
  const fields = [
    { key: "post_date", label: "Date", width: 95, editable: false },
    { key: "platform", label: "Platform", width: 75, editable: false },
    { key: "content_format", label: "Format", width: 100, editable: false },
    { key: "content_track", label: "Track", width: 130, editable: false },
    { key: "bucket", label: "Bucket", width: 140, editable: false },
    { key: "post_brief", label: "Brief", width: 180, editable: true },
    { key: "visual_hook", label: "Visual Hook", width: 280, editable: true },
    { key: "caption", label: "Caption", width: 240, editable: true },
    { key: "notes", label: "Notes", width: 120, editable: true },
  ];
  const updateCell = (rowIdx, key, value) => onChange(posts.map((p, i) => (i === rowIdx ? { ...p, [key]: value } : p)));
  const bucketColor = (bucketStr) => { const letter = (bucketStr || "").charAt(0); if (["A", "B"].includes(letter)) return "red"; if (["C", "D"].includes(letter)) return "green"; if (["E", "F"].includes(letter)) return "violet"; return "orange"; };

  return (
    <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid var(--border)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr>
            <th style={{ padding: "10px 8px", textAlign: "left", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-tertiary)", background: "var(--bg-inset)", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, zIndex: 1 }}>#</th>
            {fields.map((f) => <th key={f.key} style={{ padding: "10px 8px", textAlign: "left", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-tertiary)", background: "var(--bg-inset)", borderBottom: "1px solid var(--border)", minWidth: f.width, position: "sticky", top: 0, zIndex: 1 }}>{f.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {posts.map((post, i) => (
            <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
              <td style={{ padding: "8px", color: "var(--text-tertiary)", fontWeight: 600, verticalAlign: "top" }}>{i + 1}</td>
              {fields.map((f) => f.editable ? (
                <td key={f.key} style={{ padding: "4px", verticalAlign: "top" }}>
                  <textarea value={post[f.key] || ""} onChange={(e) => updateCell(i, f.key, e.target.value)} rows={3}
                    style={{ width: "100%", minWidth: f.width, background: "transparent", border: "1px solid transparent", borderRadius: 6, padding: "6px 8px", fontSize: 12, color: "var(--text)", resize: "vertical", outline: "none", lineHeight: 1.5, fontFamily: "'Inter', system-ui, sans-serif", transition: "border-color 0.15s" }}
                    onFocus={(e) => { e.target.style.borderColor = "var(--accent-border)"; e.target.style.background = "var(--bg-inset)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "transparent"; e.target.style.background = "transparent"; }}
                  />
                </td>
              ) : (
                <td key={f.key} style={{ padding: "8px", verticalAlign: "top", fontSize: 12, color: "var(--text-secondary)" }}>
                  {f.key === "bucket" ? <Badge color={bucketColor(post[f.key])}>{post[f.key]}</Badge>
                    : f.key === "content_track" ? <Badge color={post[f.key]?.includes("Program") ? "violet" : "orange"}>{post[f.key]}</Badge>
                    : post[f.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Wizard Component ───
export default function ContentEngineTab() {
  // Step 1: Brief & Inspo
  const [brief, setBrief] = useState("");
  const [inspoImages, setInspoImages] = useState([]);
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
  // Results
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sheetsUploading, setSheetsUploading] = useState(false);

  const tog = (arr, setter, val) => setter((p) => p.includes(val) ? p.filter((x) => x !== val) : [...p, val]);
  const schoolChange = (s) => { setSchool(s); setProgram(SP[s]?.[0] || ""); };

  const totalBucketCount = () => {
    const active = trackMode === "A" ? ["A","B","C","D","E","F"] : trackMode === "B" ? ["G","H","I"] : ["A","B","C","D","E","F","G","H","I"];
    return active.reduce((sum, l) => sum + (bucketCounts[l] || 0), 0);
  };
  const activeBuckets = trackMode === "A" ? TRACK_A_BUCKETS : trackMode === "B" ? TRACK_B_BUCKETS : [...TRACK_A_BUCKETS, ...TRACK_B_BUCKETS];

  // Image upload
  const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
  const handleImageFiles = (files) => {
    const valid = Array.from(files).filter((f) => ACCEPTED_TYPES.includes(f.type));
    if (!valid.length) { toast.error("Only JPEG, PNG, and WebP images"); return; }
    const remaining = 3 - inspoImages.length;
    if (remaining <= 0) { toast.error("Maximum 3 images"); return; }
    valid.slice(0, remaining).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => setInspoImages((prev) => prev.length >= 3 ? prev : [...prev, { file, preview: ev.target.result, mediaType: file.type }]);
      reader.readAsDataURL(file);
    });
  };
  const removeImage = (idx) => setInspoImages((prev) => prev.filter((_, i) => i !== idx));
  const handleDrop = (e) => { e.preventDefault(); e.currentTarget.style.borderColor = "var(--border)"; handleImageFiles(e.dataTransfer.files); };
  const handleDragOver = (e) => { e.preventDefault(); e.currentTarget.style.borderColor = "var(--accent)"; };
  const handleDragLeave = (e) => { e.currentTarget.style.borderColor = "var(--border)"; };

  // Validation
  const hasDates = dateMode === "dates" ? dates.length > 0 : (dateRange.start && dateRange.end);
  const hasBrief = brief.trim().length > 0 || inspoImages.length > 0;
  const canGenerate = hasBrief && hasDates && platforms.length > 0 && totalBucketCount() > 0;

  // Generate
  const generate = async () => {
    if (!canGenerate) return;
    if (posts.length > 0 && !window.confirm("You have unsaved posts. Generating new content will replace them. Continue?")) return;
    setLoading(true);
    try {
      const activeBucketLetters = trackMode === "A" ? ["A","B","C","D","E","F"] : trackMode === "B" ? ["G","H","I"] : ["A","B","C","D","E","F","G","H","I"];
      const filteredBuckets = {};
      for (const l of activeBucketLetters) { if (bucketCounts[l] > 0) filteredBuckets[l] = bucketCounts[l]; }

      let images = null;
      if (inspoImages.length > 0) {
        images = inspoImages.map((img) => ({ data: img.preview.split(",")[1], mediaType: img.mediaType }));
      }

      const payload = {
        trackMode,
        programContext: { school, program },
        buckets: filteredBuckets,
        brief: brief.trim(),
        images,
        dates, dateMode, dateRange, platforms,
        formatMix: Object.values(formatCounts).some((v) => v > 0) ? formatCounts : null,
      };

      const res = await fetch("/api/generate-content-engine", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPosts(data.posts);
      toast.success(`Generated ${data.posts.length} posts`);
    } catch (err) {
      toast.error(err.message || "Generation failed.");
    } finally { setLoading(false); }
  };

  // Google Sheets upload
  const uploadToSheets = async () => {
    if (!posts.length) return;
    setSheetsUploading(true);
    try {
      const csvData = buildCsvString(posts);
      const fileName = `${school} - ${program} - Content Calendar`;
      const r = await fetch("/api/upload-to-sheets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ csvData, fileName }) });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      window.open(d.url, "_blank");
      toast.success("Uploaded to Google Drive");
    } catch (e) { toast.error(e.message); } finally { setSheetsUploading(false); }
  };

  return (
    <div className="space-y-5">

      {/* ─── Step 1: Brief & Inspiration ─── */}
      <Card>
        <div style={{ padding: 24 }} className="space-y-4">
          <StepHeader number={1} title="Brief & Inspiration" subtitle="Text prompt required. Image inspo optional." />
          <div>
            <Lbl>Creative Brief / Direction</Lbl>
            <textarea value={brief} onChange={(e) => setBrief(e.target.value)} placeholder="Describe the campaign theme, direction, tone, or anything the AI should know..." rows={3}
              style={{ width: "100%", background: "var(--bg-inset)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "var(--text)", outline: "none", resize: "vertical", fontFamily: "'Inter', system-ui, sans-serif" }} />
          </div>
          <div>
            <Lbl>Inspiration Images (Optional — Max 3)</Lbl>
            <div onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
              onClick={() => { if (inspoImages.length < 3) document.getElementById("wizard-inspo-upload")?.click(); }}
              className="cursor-pointer"
              style={{ border: "2px dashed var(--border)", borderRadius: 12, padding: inspoImages.length ? "16px" : "24px 16px", textAlign: "center", transition: "border-color 0.2s", background: "var(--bg-inset)" }}>
              {inspoImages.length === 0 && (
                <div>
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="var(--text-tertiary)" strokeWidth={1.5} style={{ margin: "0 auto 6px" }}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <p style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 500 }}>Drop images here or click to upload</p>
                </div>
              )}
              {inspoImages.length > 0 && (
                <div className="flex gap-3 flex-wrap justify-center" onClick={(e) => e.stopPropagation()}>
                  {inspoImages.map((img, i) => (
                    <div key={i} style={{ position: "relative", width: 64, height: 64, borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)" }}>
                      <img src={img.preview} alt={`Inspo ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button onClick={(e) => { e.stopPropagation(); removeImage(i); }} className="cursor-pointer" style={{ position: "absolute", top: 2, right: 2, width: 16, height: 16, borderRadius: 99, background: "rgba(0,0,0,0.7)", color: "#fff", border: "none", fontSize: 10, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>&times;</button>
                    </div>
                  ))}
                  {inspoImages.length < 3 && <button onClick={() => document.getElementById("wizard-inspo-upload")?.click()} className="cursor-pointer" style={{ width: 64, height: 64, borderRadius: 8, border: "2px dashed var(--border)", background: "transparent", color: "var(--text-tertiary)", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>}
                </div>
              )}
              <input id="wizard-inspo-upload" type="file" accept="image/jpeg,image/png,image/webp" multiple style={{ display: "none" }} onChange={(e) => { handleImageFiles(e.target.files); e.target.value = ""; }} />
            </div>
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

      {/* ─── Generate Button ─── */}
      <div className="flex items-center gap-4">
        <Btn onClick={generate} disabled={loading || !canGenerate}>
          {loading ? <><Spinner /> Generating…</> : <><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>Generate Content Calendar</>}
        </Btn>
        <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
          {totalBucketCount()} post{totalBucketCount() !== 1 ? "s" : ""} queued
          {!canGenerate && !loading && <span style={{ color: "var(--red)", marginLeft: 8 }}>
            {!hasBrief ? "— add a brief or image" : !hasDates ? "— add dates" : platforms.length === 0 ? "— select platforms" : totalBucketCount() === 0 ? "— set bucket quantities" : ""}
          </span>}
        </span>
      </div>

      {/* ─── Results ─── */}
      <AnimatePresence>
        {posts.length > 0 && (
          <MotionDiv initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <Card>
              <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)" }} className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>Content Calendar</h3>
                  <Badge color="orange">{posts.length} posts</Badge>
                </div>
                <div className="flex gap-2">
                  <Btn2 onClick={uploadToSheets} disabled={sheetsUploading} color="green">
                    {sheetsUploading ? <><Spinner /> Uploading...</> : <><svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>CSV to GDrive</>}
                  </Btn2>
                  <Btn2 onClick={() => { downloadCSV(posts, school, program); toast.success("CSV downloaded"); }}>
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>Download CSV
                  </Btn2>
                  <button onClick={() => { if (window.confirm("Remove all generated posts?")) setPosts([]); }} className="cursor-pointer flex items-center gap-1.5" style={{ color: "var(--red)", background: "var(--red-bg)", border: "1px solid var(--red-border)", fontWeight: 600, padding: "7px 14px", borderRadius: 10, fontSize: 12, transition: "all 0.15s" }}>
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>Remove Posts
                  </button>
                </div>
              </div>
              <div style={{ padding: 16 }}>
                <EditableTable posts={posts} onChange={setPosts} />
              </div>
            </Card>
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
}
