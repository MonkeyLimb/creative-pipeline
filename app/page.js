"use client";

import { useState, useCallback, useRef } from "react";

const SCHOOL_PROGRAMS = {
  UMA: [
    "Clinical Medical Assistant",
    "Healthcare Management",
    "Healthcare Administration",
    "Medical Billing and Coding",
    "Health and Human Services",
    "Medical Administrative Assistant",
    "Pharmacy Technician",
    "Health Information Technology",
  ],
  SNHU: ["Psychology"],
  AIU: ["Criminal Justice"],
  CTU: ["Information Technology"],
  FSU: [
    "Music Production",
    "Game Development",
    "Cybersecurity",
    "Information Technology",
  ],
  CCI: [
    "Pharmacy Technician",
    "Radiology",
    "Medical Billing and Coding",
    "Medical Assistant",
  ],
  Herzing: ["Sterile Processing Technician"],
  MedCerts: ["Phlebotomy Technician", "EKG Technician"],
};

const SCHOOLS = Object.keys(SCHOOL_PROGRAMS);
const PLATFORMS = ["facebook", "instagram", "tiktok"];
const CSV_PLACEHOLDER = `Program,Hook Format,Messaging Archetype,Avatar Type,Offer Angle,Hook Text,Subtext,CTA,Visual Prompt,Cloudinary URL
Medical Assistant,transformation,...`;

// ── CSV parser ──
function parseCSV(text) {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  const rawHeaders = lines[0].split(",").map((h) => h.trim());
  const headerMap = {};
  rawHeaders.forEach((h, i) => {
    const key = h
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
    headerMap[i] = key;
  });

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = [];
    let current = "";
    let inQuotes = false;
    for (let j = 0; j < line.length; j++) {
      const ch = line[j];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    values.push(current.trim());

    const row = {};
    rawHeaders.forEach((_, idx) => {
      row[headerMap[idx]] = values[idx] || "";
    });
    rows.push(row);
  }
  return rows;
}

function mapCSVRow(row, index) {
  return {
    id: index,
    program: row.program || "",
    hook_format: row.hook_format || "",
    messaging_archetype: row.messaging_archetype || "",
    avatar_type: row.avatar_type || "",
    offer_angle: row.offer_angle || "",
    hook: row.hook_text || "",
    subtext: row.subtext || "",
    cta: row.cta || "",
    canva_prompt: row.visual_prompt || "",
    cloudinary_url: row.cloudinary_url || "",
    compliance_notes: [],
    status: "pending", // pending → queued → committing → done | error
    design_url: null,
    folder_url: null,
    folder_name: null,
    copy_text: [],
    image_preview: null,
    error: null,
  };
}

// ── Pill button ──
function Pill({ label, active, icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
        active
          ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
          : "bg-gray-800 text-gray-400 hover:text-gray-300 border border-gray-700"
      }`}
    >
      {icon && <span className="text-xs">{icon}</span>}
      {label}
    </button>
  );
}

// ── Status badge ──
function StatusBadge({ status }) {
  const styles = {
    pending: "bg-gray-700/60 text-gray-400 border-gray-600",
    queued: "bg-yellow-900/40 text-yellow-400 border-yellow-700/50",
    committing: "bg-blue-900/40 text-blue-400 border-blue-700/50 animate-pulse",
    done: "bg-emerald-900/40 text-emerald-400 border-emerald-700/50",
    error: "bg-red-900/40 text-red-400 border-red-700/50",
  };
  const labels = {
    pending: "pending",
    queued: "queued",
    committing: "committing",
    done: "done",
    error: "error",
  };
  return (
    <span
      className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded border ${
        styles[status] || styles.pending
      }`}
    >
      {labels[status] || status}
    </span>
  );
}

// ── Editable field ──
function EditableField({ value, onChange, multiline, label }) {
  const cls =
    "w-full bg-gray-900/60 border border-gray-700/50 rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-orange-500/50 focus:border-orange-500/50 placeholder-gray-600";
  return (
    <div>
      {label && (
        <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5 block">
          {label}
        </label>
      )}
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          className={`${cls} resize-y`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cls}
        />
      )}
    </div>
  );
}

// ── Progress bar ──
function ProgressBar({ completed, total }) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] text-gray-500 uppercase tracking-wider">
        <span>Progress</span>
        <span>
          {completed}/{total} &middot; {pct}%
        </span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-orange-500 h-1.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── Copy block — shows text to paste into Canva ──
function CopyBlock({ copyText }) {
  if (!copyText || copyText.length === 0) return null;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-gray-950/50 border border-gray-700/30 rounded-lg p-3 space-y-1.5">
      <label className="text-[10px] uppercase tracking-wider text-gray-500 block">
        Copy into Canva
      </label>
      {copyText.map((line, i) => (
        <div key={i} className="flex items-start gap-2 group">
          <p className="text-xs text-gray-300 flex-1 leading-relaxed">{line}</p>
          <button
            onClick={() => handleCopy(line)}
            className="text-[10px] text-gray-600 hover:text-orange-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            copy
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Creative card ──
function CreativeCard({ creative, index, onUpdate, onCommitSingle, onRebuild }) {
  const update = (field, value) => {
    onUpdate(index, { ...creative, [field]: value });
  };

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 space-y-3 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-gray-600">#{index + 1}</span>
          {creative.program && (
            <span className="text-xs text-gray-400">{creative.program}</span>
          )}
        </div>
        <StatusBadge status={creative.status} />
      </div>

      {/* Editable copy fields */}
      <div className="space-y-2">
        <EditableField label="Hook" value={creative.hook} onChange={(v) => update("hook", v)} />
        <EditableField label="Subtext" value={creative.subtext} onChange={(v) => update("subtext", v)} multiline />
        <EditableField label="CTA" value={creative.cta} onChange={(v) => update("cta", v)} />
      </div>

      {/* Done state — image preview + links + copy text */}
      {creative.status === "done" && (
        <div className="space-y-3">
          {creative.image_preview && (
            <img
              src={creative.image_preview}
              alt="Generated design"
              className="w-full rounded-lg border border-gray-700/50"
            />
          )}
          <div className="flex gap-3">
            {creative.design_url && (
              <a
                href={creative.design_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-orange-400 hover:text-orange-300 font-medium"
              >
                Open in Canva &#x2197;
              </a>
            )}
            {creative.folder_url && (
              <a
                href={creative.folder_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-orange-400 hover:text-orange-300 font-medium"
              >
                Folder &#x2197;
              </a>
            )}
          </div>
          <CopyBlock copyText={creative.copy_text} />
        </div>
      )}

      {/* Error + rebuild */}
      {creative.status === "error" && (
        <div className="space-y-2">
          <p className="text-xs text-red-400/80">{creative.error || "An error occurred"}</p>
          <button
            onClick={() => onRebuild(index)}
            className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1 rounded-lg border border-red-500/20 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Pending — single commit button */}
      {creative.status === "pending" && (
        <button
          onClick={() => onCommitSingle(index)}
          className="text-xs bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 px-3 py-1.5 rounded-lg border border-orange-500/20 transition-colors font-medium"
        >
          Commit to Canva
        </button>
      )}
    </div>
  );
}

// ── Main page ──
export default function Home() {
  const [school, setSchool] = useState("UMA");
  const [program, setProgram] = useState(SCHOOL_PROGRAMS["UMA"][0]);
  const [creativeType, setCreativeType] = useState("Paid");
  const [platform, setPlatform] = useState("instagram");
  const [csvText, setCsvText] = useState("");
  const [creatives, setCreatives] = useState([]);
  const [parseError, setParseError] = useState("");
  const [committing, setCommitting] = useState(false);
  const [committedCount, setCommittedCount] = useState(0);
  const [allDone, setAllDone] = useState(false);
  const creativesRef = useRef([]);

  const programs = SCHOOL_PROGRAMS[school] || [];

  const handleSchoolChange = (s) => {
    setSchool(s);
    const progs = SCHOOL_PROGRAMS[s] || [];
    setProgram(progs[0] || "");
  };

  const setCreativesSync = (updater) => {
    setCreatives((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      creativesRef.current = next;
      return next;
    });
  };

  const updateCreative = useCallback((index, updated) => {
    setCreativesSync((prev) => prev.map((c, i) => (i === index ? updated : c)));
  }, []);

  // ── Load CSV ──
  const handleLoadCSV = () => {
    setParseError("");
    setAllDone(false);
    setCommittedCount(0);

    if (!csvText.trim()) {
      setParseError("Paste CSV data first.");
      return;
    }
    const rows = parseCSV(csvText);
    if (rows.length === 0) {
      setParseError("No data rows found. Ensure a header row + at least one data row.");
      return;
    }
    const mapped = rows.map((r, i) => mapCSVRow(r, i));
    setCreativesSync(mapped);
  };

  // ── Commit one row ──
  const commitRow = async (index) => {
    const c = creativesRef.current[index];

    setCreativesSync((prev) =>
      prev.map((cr, i) => (i === index ? { ...cr, status: "committing", error: null } : cr))
    );

    try {
      const res = await fetch("/api/commit-row", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          school,
          program: c.program || program,
          platform,
          creative_type: creativeType,
          hook: c.hook,
          subtext: c.subtext,
          cta: c.cta,
          canva_prompt: c.canva_prompt,
          cloudinary_url: c.cloudinary_url || "",
        }),
      });
      const result = await res.json();

      if (result.status === "success") {
        setCreativesSync((prev) =>
          prev.map((cr, i) =>
            i === index
              ? {
                  ...cr,
                  status: "done",
                  design_url: result.design_url,
                  folder_url: result.folder_url,
                  folder_name: result.folder_name,
                  copy_text: result.copy_text || [],
                  image_preview: result.image_preview || null,
                }
              : cr
          )
        );
        return true;
      } else {
        setCreativesSync((prev) =>
          prev.map((cr, i) =>
            i === index ? { ...cr, status: "error", error: result.error } : cr
          )
        );
        return false;
      }
    } catch (err) {
      setCreativesSync((prev) =>
        prev.map((cr, i) =>
          i === index ? { ...cr, status: "error", error: err.message } : cr
        )
      );
      return false;
    }
  };

  // ── Commit All ──
  const handleCommitAll = async () => {
    setCommitting(true);
    setAllDone(false);
    let completed = 0;

    // Mark pending as queued
    setCreativesSync((prev) =>
      prev.map((c) => (c.status === "pending" ? { ...c, status: "queued" } : c))
    );

    for (let i = 0; i < creativesRef.current.length; i++) {
      const status = creativesRef.current[i].status;
      if (status !== "queued") continue;
      const ok = await commitRow(i);
      if (ok) completed++;
      setCommittedCount(completed);
    }

    setAllDone(true);
    setCommitting(false);
  };

  // ── Retry failed row ──
  const handleRetry = async (index) => {
    setCreativesSync((prev) =>
      prev.map((c, i) => (i === index ? { ...c, status: "pending", error: null } : c))
    );
    await commitRow(index);
  };

  const doneCount = creatives.filter((c) => c.status === "done").length;
  const pendingCount = creatives.filter(
    (c) => c.status === "pending" || c.status === "queued"
  ).length;

  const selectCls =
    "bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-orange-500/50 focus:border-orange-500/50";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6">
      {/* Header */}
      <header className="mb-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-500 mb-1">
          Dreambound
        </p>
        <h1 className="text-2xl font-bold text-white leading-tight">
          Creative Pipeline
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Single stream &middot; Checkpoint routing &middot; Auto-rebuild
        </p>
      </header>

      {/* Controls */}
      <section className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 mb-6 space-y-5 backdrop-blur-sm">
        {/* School + Program */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1.5 block">
              School
            </label>
            <select
              value={school}
              onChange={(e) => handleSchoolChange(e.target.value)}
              className={`${selectCls} w-full`}
            >
              {SCHOOLS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1.5 block">
              Program
            </label>
            <select
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              className={`${selectCls} w-full`}
            >
              {programs.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Creative Type + Platform */}
        <div className="flex flex-wrap items-end gap-6">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-2 block">
              Creative Type
            </label>
            <div className="flex gap-2">
              <Pill
                label="Paid"
                icon="&#x1F4B0;"
                active={creativeType === "Paid"}
                onClick={() => setCreativeType("Paid")}
              />
              <Pill
                label="Organic"
                icon="&#x1F331;"
                active={creativeType === "Organic"}
                onClick={() => setCreativeType("Organic")}
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-2 block">
              Platform
            </label>
            <div className="flex gap-2">
              {PLATFORMS.map((p) => (
                <Pill
                  key={p}
                  label={p}
                  active={platform === p}
                  onClick={() => setPlatform(p)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* CSV paste */}
        <div>
          <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1.5 block">
            Paste CSV
          </label>
          <textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder={CSV_PLACEHOLDER}
            rows={6}
            className="w-full bg-gray-950 border border-gray-700/50 rounded-xl px-4 py-3 text-sm text-gray-300 font-mono focus:outline-none focus:ring-1 focus:ring-orange-500/50 focus:border-orange-500/50 placeholder-gray-600 resize-y"
          />
          <p className="text-[10px] text-gray-600 mt-1">Paste CSV</p>
        </div>

        {parseError && <p className="text-xs text-red-400">{parseError}</p>}

        <div className="flex justify-end">
          <button
            onClick={handleLoadCSV}
            disabled={committing}
            className="bg-orange-500 hover:bg-orange-400 disabled:bg-orange-800 disabled:text-gray-400 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors shadow-lg shadow-orange-500/10"
          >
            Load Creatives
          </button>
        </div>
      </section>

      {/* Creatives section */}
      {creatives.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
              Creatives &middot; {creatives.length} rows
            </h2>
            <div className="flex items-center gap-2">
              {(committing || allDone) && (
                <span className="text-xs text-gray-400 font-mono">
                  {doneCount}/{creatives.length}
                </span>
              )}
              {pendingCount > 0 && (
                <button
                  onClick={handleCommitAll}
                  disabled={committing}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900 disabled:text-gray-500 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-colors"
                >
                  {committing ? "Committing..." : `Commit All (${pendingCount})`}
                </button>
              )}
            </div>
          </div>

          {(committing || allDone) && (
            <ProgressBar completed={doneCount} total={creatives.length} />
          )}

          {allDone && (
            <div className="bg-emerald-900/20 border border-emerald-800/40 rounded-xl p-4">
              <p className="text-sm text-emerald-400">
                Pipeline complete. {committedCount} of {creatives.length} designs created.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {creatives.map((c, i) => (
              <CreativeCard
                key={i}
                creative={c}
                index={i}
                onUpdate={updateCreative}
                onCommitSingle={commitRow}
                onRebuild={handleRetry}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
