"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// ─── School/Program mapping (mirrored from main page) ───
const SP = {
  General: ["Brand Awareness", "Platform Growth", "Community", "Partnerships", "Events"],
  UMA: ["Clinical Medical Assistant", "Healthcare Management", "Healthcare Administration", "Medical Billing and Coding", "Health and Human Services", "Medical Administrative Assistant", "Pharmacy Technician", "Health Information Technology"],
  SNHU: ["Psychology"], AIU: ["Criminal Justice"], CTU: ["Information Technology"],
  FSU: ["Music Production", "Game Development", "Cybersecurity", "Information Technology"],
  CCI: ["Pharmacy Technician", "Radiology", "Medical Billing and Coding", "Medical Assistant"],
  Herzing: ["Sterile Processing Technician"], MedCerts: ["Phlebotomy Technician", "EKG Technician"],
};
const SCHOOLS = Object.keys(SP);

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

// ─── Primitives (matching main app style) ───
const MotionDiv = motion.div;

function Card({ children, className = "" }) {
  return (
    <div className={className} style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 16, boxShadow: "var(--card-shadow)" }}>
      {children}
    </div>
  );
}

function Lbl({ children }) {
  return <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-tertiary)", marginBottom: 8 }}>{children}</div>;
}

function Chip({ label, active, onClick }) {
  return (
    <button onClick={onClick} className="relative cursor-pointer" style={{ padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600, border: "1px solid transparent", transition: "all 0.2s", ...(active ? { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)", boxShadow: "var(--accent-glow)" } : { background: "var(--bg-inset)", color: "var(--text-secondary)", borderColor: "var(--border)" }) }}>
      {label}
    </button>
  );
}

function Btn({ onClick, disabled, children }) {
  return (
    <button onClick={onClick} disabled={disabled} className="disabled:opacity-40 cursor-pointer flex items-center gap-2" style={{ background: "var(--accent)", color: "#fff", fontWeight: 700, padding: "11px 24px", borderRadius: 12, fontSize: 13, border: "none", boxShadow: "var(--accent-glow)", transition: "all 0.15s", letterSpacing: "0.01em" }}>
      {children}
    </button>
  );
}

function Btn2({ onClick, disabled, children, color = "green" }) {
  const c = { green: { color: "var(--green)", bg: "var(--green-bg)", border: "var(--green-border)" }, violet: { color: "var(--violet)", bg: "var(--violet-bg)", border: "var(--violet-border)" } };
  const s = c[color];
  return (
    <button onClick={onClick} disabled={disabled} className="disabled:opacity-40 cursor-pointer flex items-center gap-1.5" style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}`, fontWeight: 600, padding: "7px 14px", borderRadius: 10, fontSize: 12, transition: "all 0.15s" }}>
      {children}
    </button>
  );
}

function Spinner() { return <span className="spinner" />; }

function Sel({ value, onChange, options }) {
  return <select value={value} onChange={(e) => onChange(e.target.value)} style={{ width: "100%", background: "var(--bg-inset)", border: "1px solid var(--border)", borderRadius: 10, padding: "9px 14px", fontSize: 13, color: "var(--text)", outline: "none", cursor: "pointer" }}>{options.map((o) => <option key={o} value={o}>{o}</option>)}</select>;
}

function Badge({ children, color = "default" }) {
  const c = { default: { bg: "var(--bg-inset)", color: "var(--text-tertiary)", border: "var(--border)" }, orange: { bg: "var(--accent-bg)", color: "var(--accent)", border: "var(--accent-border)" }, green: { bg: "var(--green-bg)", color: "var(--green)", border: "var(--green-border)" }, violet: { bg: "var(--violet-bg)", color: "var(--violet)", border: "var(--violet-border)" }, red: { bg: "var(--red-bg)", color: "var(--red)", border: "var(--red-border)" } };
  const s = c[color] || c.default;
  return <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 6, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{children}</span>;
}

// ─── CSV helpers ───
function escapeCSV(val) {
  if (!val) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function downloadCSV(posts) {
  const headers = ["Content_Track", "Bucket_Letter", "Hook", "Body_Text", "Call_To_Action", "Suggested_Canva_Visual_Type"];
  const lines = [headers.join(",")];
  for (const post of posts) {
    lines.push(headers.map((h) => escapeCSV(post[h])).join(","));
  }
  const csv = lines.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `content_engine_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Bucket Quantity Row ───
function BucketRow({ bucket, count, onChange }) {
  const colorMap = { red: "var(--red)", green: "var(--green)", violet: "var(--violet)", orange: "var(--accent)" };
  const bgMap = { red: "var(--red-bg)", green: "var(--green-bg)", violet: "var(--violet-bg)", orange: "var(--accent-bg)" };
  return (
    <div className="flex items-center gap-3" style={{ padding: "8px 0" }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: bgMap[bucket.color], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: colorMap[bucket.color], flexShrink: 0 }}>
        {bucket.letter}
      </div>
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

// ─── Editable Data Table ───
function EditableTable({ posts, onChange }) {
  const fields = [
    { key: "Content_Track", label: "Track", width: 60, editable: false },
    { key: "Bucket_Letter", label: "Bucket", width: 65, editable: false },
    { key: "Hook", label: "Hook", width: 180, editable: true },
    { key: "Body_Text", label: "Body Text", width: 280, editable: true },
    { key: "Call_To_Action", label: "CTA", width: 160, editable: true },
    { key: "Suggested_Canva_Visual_Type", label: "Visual Type", width: 180, editable: true },
  ];

  const updateCell = (rowIdx, key, value) => {
    const updated = posts.map((p, i) => (i === rowIdx ? { ...p, [key]: value } : p));
    onChange(updated);
  };

  const bucketColor = (letter) => {
    if (["A", "B"].includes(letter)) return "red";
    if (["C", "D"].includes(letter)) return "green";
    if (["E", "F"].includes(letter)) return "violet";
    return "orange";
  };

  return (
    <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid var(--border)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr>
            <th style={{ padding: "10px 8px", textAlign: "left", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-tertiary)", background: "var(--bg-inset)", borderBottom: "1px solid var(--border)", position: "sticky", top: 0 }}>
              #
            </th>
            {fields.map((f) => (
              <th key={f.key} style={{ padding: "10px 8px", textAlign: "left", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-tertiary)", background: "var(--bg-inset)", borderBottom: "1px solid var(--border)", minWidth: f.width, position: "sticky", top: 0 }}>
                {f.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {posts.map((post, i) => (
            <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
              <td style={{ padding: "8px", color: "var(--text-tertiary)", fontWeight: 600, verticalAlign: "top" }}>{i + 1}</td>
              {fields.map((f) =>
                f.editable ? (
                  <td key={f.key} style={{ padding: "4px", verticalAlign: "top" }}>
                    <textarea
                      value={post[f.key] || ""}
                      onChange={(e) => updateCell(i, f.key, e.target.value)}
                      rows={3}
                      style={{
                        width: "100%",
                        minWidth: f.width,
                        background: "transparent",
                        border: "1px solid transparent",
                        borderRadius: 6,
                        padding: "6px 8px",
                        fontSize: 12,
                        color: "var(--text)",
                        resize: "vertical",
                        outline: "none",
                        lineHeight: 1.5,
                        fontFamily: "'Inter', system-ui, sans-serif",
                        transition: "border-color 0.15s",
                      }}
                      onFocus={(e) => { e.target.style.borderColor = "var(--accent-border)"; e.target.style.background = "var(--bg-inset)"; }}
                      onBlur={(e) => { e.target.style.borderColor = "transparent"; e.target.style.background = "transparent"; }}
                    />
                  </td>
                ) : (
                  <td key={f.key} style={{ padding: "8px", verticalAlign: "top" }}>
                    <Badge color={f.key === "Bucket_Letter" ? bucketColor(post[f.key]) : "default"}>
                      {f.key === "Content_Track" ? `Track ${post[f.key]}` : `Bucket ${post[f.key]}`}
                    </Badge>
                  </td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Component ───
export default function ContentEngineTab() {
  // Track selection
  const [trackMode, setTrackMode] = useState("A");

  // Program context (Track A only)
  const [school, setSchool] = useState("General");
  const [program, setProgram] = useState(SP["General"][0]);

  // Bucket quantities
  const [bucketCounts, setBucketCounts] = useState({ A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, I: 0 });

  // Results
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const schoolChange = (s) => { setSchool(s); setProgram(SP[s]?.[0] || ""); };

  const setBucketCount = (letter, count) => {
    setBucketCounts((prev) => ({ ...prev, [letter]: count }));
  };

  const totalCount = () => {
    const activeBuckets = trackMode === "A" ? ["A", "B", "C", "D", "E", "F"] : trackMode === "B" ? ["G", "H", "I"] : ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
    return activeBuckets.reduce((sum, l) => sum + (bucketCounts[l] || 0), 0);
  };

  const generate = async () => {
    const activeBuckets = trackMode === "A" ? ["A", "B", "C", "D", "E", "F"] : trackMode === "B" ? ["G", "H", "I"] : ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
    const filteredBuckets = {};
    for (const l of activeBuckets) {
      if (bucketCounts[l] > 0) filteredBuckets[l] = bucketCounts[l];
    }

    if (Object.keys(filteredBuckets).length === 0) {
      toast.error("Set at least one bucket quantity.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        trackMode,
        programContext: trackMode !== "B" ? { school, program } : null,
        buckets: filteredBuckets,
      };

      const res = await fetch("/api/generate-content-engine", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      setPosts(data.posts);
      toast.success(`Generated ${data.posts.length} posts.`);
    } catch (err) {
      toast.error(err.message || "Generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const activeBuckets = trackMode === "A" ? TRACK_A_BUCKETS : trackMode === "B" ? TRACK_B_BUCKETS : [...TRACK_A_BUCKETS, ...TRACK_B_BUCKETS];

  return (
    <div className="space-y-5">
      {/* ─── Config Card ─── */}
      <Card>
        <div style={{ padding: 24 }} className="space-y-6">
          {/* Track Selection */}
          <div>
            <Lbl>Content Track</Lbl>
            <div className="flex gap-1.5 flex-wrap">
              <Chip label="Track A — Conversion" active={trackMode === "A"} onClick={() => setTrackMode("A")} />
              <Chip label="Track B — Community" active={trackMode === "B"} onClick={() => setTrackMode("B")} />
              <Chip label="Mixed Batch" active={trackMode === "mixed"} onClick={() => setTrackMode("mixed")} />
            </div>
          </div>

          {/* Program Context (Track A / Mixed only) */}
          {trackMode !== "B" && (
            <MotionDiv initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
              <Lbl>Program Context</Lbl>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginBottom: 4, fontWeight: 600 }}>School</div>
                  <Sel value={school} onChange={schoolChange} options={SCHOOLS} />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginBottom: 4, fontWeight: 600 }}>Program</div>
                  <Sel value={program} onChange={setProgram} options={SP[school] || []} />
                </div>
              </div>
            </MotionDiv>
          )}

          {/* Bucket Quantities */}
          <div>
            <Lbl>Posts per Bucket</Lbl>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
              {activeBuckets.map((bucket) => (
                <BucketRow key={bucket.letter} bucket={bucket} count={bucketCounts[bucket.letter] || 0} onChange={(n) => setBucketCount(bucket.letter, n)} />
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex items-center gap-4">
            <Btn onClick={generate} disabled={loading || totalCount() === 0}>
              {loading ? <><Spinner /> Generating…</> : <>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Generate Content
              </>}
            </Btn>
            <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
              {totalCount()} post{totalCount() !== 1 ? "s" : ""} queued
            </span>
          </div>
        </div>
      </Card>

      {/* ─── Results ─── */}
      <AnimatePresence>
        {posts.length > 0 && (
          <MotionDiv initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <Card>
              <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)" }} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>Generated Content</h3>
                  <Badge color="orange">{posts.length} posts</Badge>
                </div>
                <div className="flex gap-2">
                  <Btn2 onClick={() => downloadCSV(posts)} color="green">
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Download CSV
                  </Btn2>
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
