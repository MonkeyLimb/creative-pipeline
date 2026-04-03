"use client";

import { useState, useCallback } from "react";

const SCHOOLS = ["UMA", "SNHU", "AIU", "CTU", "FSU", "CCI", "Herzing", "MedCerts"];
const PLATFORMS = ["Instagram", "Facebook", "TikTok"];
const ICPS = ["Working Adult", "Career Reset", "Ambition Blocker"];
const TONES = ["Recognition", "Belief", "Awareness"];
const ARCHETYPES = [
  "Objection Flip",
  "Stat/Fact",
  "Day in the Life",
  "Pain Point",
  "Transformation",
  "Curiosity",
];

function InputForm({ onGenerate, loading }) {
  const [form, setForm] = useState({
    school: "UMA",
    program: "",
    platform: "Instagram",
    creative_type: "Paid",
    num_creatives: 5,
    icp: "Working Adult",
    tone: "Recognition",
    archetype: "Objection Flip",
    cloudinary_url: "",
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    onGenerate(form);
  };

  const fieldClass =
    "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";
  const labelClass = "block text-xs font-medium text-gray-400 mb-1";

  return (
    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div>
        <label className={labelClass}>School</label>
        <select value={form.school} onChange={set("school")} className={fieldClass}>
          {SCHOOLS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Program</label>
        <input
          type="text"
          value={form.program}
          onChange={set("program")}
          placeholder="e.g. Medical Assistant"
          required
          className={fieldClass}
        />
      </div>

      <div>
        <label className={labelClass}>Platform</label>
        <select value={form.platform} onChange={set("platform")} className={fieldClass}>
          {PLATFORMS.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Creative Type</label>
        <div className="flex gap-4 mt-1">
          {["Paid", "Organic"].map((t) => (
            <label key={t} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="creative_type"
                value={t}
                checked={form.creative_type === t}
                onChange={set("creative_type")}
                className="accent-indigo-500"
              />
              {t}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass}>Number of Creatives</label>
        <input
          type="number"
          min={1}
          max={15}
          value={form.num_creatives}
          onChange={set("num_creatives")}
          className={fieldClass}
        />
      </div>

      <div>
        <label className={labelClass}>ICP</label>
        <select value={form.icp} onChange={set("icp")} className={fieldClass}>
          {ICPS.map((i) => (
            <option key={i}>{i}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Tone</label>
        <select value={form.tone} onChange={set("tone")} className={fieldClass}>
          {TONES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Hook Archetype</label>
        <select value={form.archetype} onChange={set("archetype")} className={fieldClass}>
          {ARCHETYPES.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Cloudinary URL (optional)</label>
        <input
          type="text"
          value={form.cloudinary_url}
          onChange={set("cloudinary_url")}
          placeholder="https://res.cloudinary.com/..."
          className={fieldClass}
        />
      </div>

      <div className="md:col-span-2 lg:col-span-3 flex justify-end pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:text-gray-400 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors"
        >
          {loading ? "Generating..." : "Generate Copy"}
        </button>
      </div>
    </form>
  );
}

function EditableField({ value, onChange, multiline }) {
  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className="w-full bg-gray-800/50 border border-gray-700 rounded px-2 py-1 text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y"
      />
    );
  }
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-gray-800/50 border border-gray-700 rounded px-2 py-1 text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
    />
  );
}

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-gray-700 text-gray-300",
    queued: "bg-yellow-900/60 text-yellow-300",
    running: "bg-blue-900/60 text-blue-300",
    done: "bg-green-900/60 text-green-300",
    error: "bg-red-900/60 text-red-300",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
}

function CreativeCard({ creative, index, onUpdate, onRebuild, onCommitSingle, formParams }) {
  const update = (field, value) => {
    onUpdate(index, { ...creative, [field]: value });
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-300">Creative #{index + 1}</h3>
        <div className="flex items-center gap-2">
          {creative.compliance_notes && (
            <span className="text-xs text-green-400">{creative.compliance_notes.length} compliance notes</span>
          )}
          <StatusBadge status={creative.status} />
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <label className="text-xs text-gray-500">Hook</label>
          <EditableField value={creative.hook} onChange={(v) => update("hook", v)} />
        </div>
        <div>
          <label className="text-xs text-gray-500">Subtext</label>
          <EditableField value={creative.subtext} onChange={(v) => update("subtext", v)} multiline />
        </div>
        <div>
          <label className="text-xs text-gray-500">CTA</label>
          <EditableField value={creative.cta} onChange={(v) => update("cta", v)} />
        </div>
      </div>

      {creative.status === "done" && creative.design_url && (
        <div className="flex gap-3 pt-1">
          <a
            href={creative.design_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-400 hover:text-indigo-300"
          >
            Design &#x2197;
          </a>
          {creative.folder_url && (
            <a
              href={creative.folder_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-400 hover:text-indigo-300"
            >
              Folder &#x2197;
            </a>
          )}
        </div>
      )}

      {creative.status === "error" && (
        <div className="space-y-2">
          <p className="text-xs text-red-400">{creative.error || "An error occurred"}</p>
          <button
            onClick={() => onRebuild(index)}
            className="text-xs bg-red-900/40 hover:bg-red-900/60 text-red-300 px-3 py-1 rounded transition-colors"
          >
            Rebuild
          </button>
        </div>
      )}

      {creative.status === "rebuilt" && (
        <button
          onClick={() => onCommitSingle(index)}
          className="text-xs bg-indigo-700 hover:bg-indigo-600 text-white px-3 py-1 rounded transition-colors"
        >
          Commit
        </button>
      )}
    </div>
  );
}

function ProgressBar({ completed, total }) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  return (
    <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
      <div
        className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function Home() {
  const [creatives, setCreatives] = useState([]);
  const [formParams, setFormParams] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [committedCount, setCommittedCount] = useState(0);
  const [allDone, setAllDone] = useState(false);

  const updateCreative = useCallback((index, updated) => {
    setCreatives((prev) => prev.map((c, i) => (i === index ? updated : c)));
  }, []);

  const handleGenerate = async (form) => {
    setGenerating(true);
    setFormParams(form);
    setCreatives([]);
    setAllDone(false);
    setCommittedCount(0);

    try {
      const res = await fetch("/api/generate-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCreatives(data.creatives);
    } catch (err) {
      alert("Generation failed: " + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const commitRow = async (index) => {
    const c = creatives[index];
    const payload = {
      school: formParams.school,
      program: formParams.program,
      platform: formParams.platform,
      creative_type: formParams.creative_type,
      hook: c.hook,
      subtext: c.subtext,
      cta: c.cta,
      canva_prompt: c.canva_prompt,
      cloudinary_url: c.cloudinary_url || formParams.cloudinary_url || "",
    };

    setCreatives((prev) =>
      prev.map((cr, i) => (i === index ? { ...cr, status: "running" } : cr))
    );

    try {
      const res = await fetch("/api/commit-row", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (result.status === "success") {
        setCreatives((prev) =>
          prev.map((cr, i) =>
            i === index
              ? {
                  ...cr,
                  status: "done",
                  design_url: result.design_url,
                  folder_url: result.folder_url,
                  folder_name: result.folder_name,
                }
              : cr
          )
        );
        return true;
      } else {
        setCreatives((prev) =>
          prev.map((cr, i) =>
            i === index ? { ...cr, status: "error", error: result.error } : cr
          )
        );
        return false;
      }
    } catch (err) {
      setCreatives((prev) =>
        prev.map((cr, i) =>
          i === index ? { ...cr, status: "error", error: err.message } : cr
        )
      );
      return false;
    }
  };

  const handleCommitAll = async () => {
    setCommitting(true);
    setAllDone(false);
    let completed = 0;

    // Mark all pending as queued
    setCreatives((prev) =>
      prev.map((c) => (c.status === "pending" ? { ...c, status: "queued" } : c))
    );

    for (let i = 0; i < creatives.length; i++) {
      if (creatives[i].status !== "queued" && creatives[i].status !== "pending") continue;
      const success = await commitRow(i);
      if (success) completed++;
      setCommittedCount(completed);
    }

    setAllDone(true);
    setCommitting(false);
  };

  const handleRebuild = async (index) => {
    if (!formParams) return;

    setCreatives((prev) =>
      prev.map((c, i) => (i === index ? { ...c, status: "running" } : c))
    );

    try {
      const res = await fetch("/api/generate-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formParams, num_creatives: 1 }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const rebuilt = data.creatives[0];
      setCreatives((prev) =>
        prev.map((c, i) =>
          i === index ? { ...c, ...rebuilt, id: index, status: "rebuilt" } : c
        )
      );
    } catch (err) {
      setCreatives((prev) =>
        prev.map((c, i) =>
          i === index ? { ...c, status: "error", error: err.message } : c
        )
      );
    }
  };

  const handleCommitSingle = async (index) => {
    await commitRow(index);
  };

  const pendingCount = creatives.filter(
    (c) => c.status === "pending" || c.status === "queued" || c.status === "running"
  ).length;
  const doneCount = creatives.filter((c) => c.status === "done").length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dreambound Creative Pipeline</h1>
        <p className="text-sm text-gray-500 mt-1">
          Generate compliant ad copy and commit designs to Canva
        </p>
      </header>

      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Campaign Settings
        </h2>
        <InputForm onGenerate={handleGenerate} loading={generating} />
      </section>

      {creatives.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Generated Creatives ({creatives.length})
            </h2>
            <div className="flex items-center gap-3">
              {committing && (
                <span className="text-xs text-gray-400">
                  {doneCount} / {creatives.length}
                </span>
              )}
              <button
                onClick={handleCommitAll}
                disabled={committing || generating}
                className="bg-green-700 hover:bg-green-600 disabled:bg-green-900 disabled:text-gray-500 text-white font-medium px-5 py-2 rounded-lg text-sm transition-colors"
              >
                {committing ? "Committing..." : "Commit All"}
              </button>
            </div>
          </div>

          {(committing || allDone) && (
            <div className="mb-4 space-y-2">
              <ProgressBar completed={doneCount} total={creatives.length} />
            </div>
          )}

          {allDone && (
            <div className="mb-4 bg-green-900/30 border border-green-800 rounded-lg p-4">
              <p className="text-sm text-green-300">
                Pipeline complete. {committedCount} of {creatives.length} creatives committed
                successfully.
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
                onRebuild={handleRebuild}
                onCommitSingle={handleCommitSingle}
                formParams={formParams}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
