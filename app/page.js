"use client";

import { useState } from "react";

const SCHOOL_PROGRAMS = {
  UMA: ["Clinical Medical Assistant", "Healthcare Management", "Healthcare Administration", "Medical Billing and Coding", "Health and Human Services", "Medical Administrative Assistant", "Pharmacy Technician", "Health Information Technology"],
  SNHU: ["Psychology"],
  AIU: ["Criminal Justice"],
  CTU: ["Information Technology"],
  FSU: ["Music Production", "Game Development", "Cybersecurity", "Information Technology"],
  CCI: ["Pharmacy Technician", "Radiology", "Medical Billing and Coding", "Medical Assistant"],
  Herzing: ["Sterile Processing Technician"],
  MedCerts: ["Phlebotomy Technician", "EKG Technician"],
};

const SCHOOLS = Object.keys(SCHOOL_PROGRAMS);
const PLATFORMS = ["Instagram", "Facebook", "TikTok"];
const SIZES = ["4:5", "1:1", "9:16", "16:9"];
const CREATIVE_TYPES = ["Paid", "Organic"];
const ICPS = ["Working Adult", "Career Reset", "Ambition Blocker"];
const TONES = ["Recognition", "Belief", "Awareness"];
const HOOKS = ["Objection Flip", "Stat/Fact", "Day in the Life", "Pain Point", "Transformation", "Curiosity"];
const DATE_RANGES = ["1 Week", "2 Weeks", "1 Month"];
const POST_COUNTS = [3, 5, 7, 10, 14, 20, 30];

function Chip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
        active
          ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
          : "bg-gray-800/80 text-gray-400 hover:text-gray-300 border border-gray-700/50 hover:border-gray-600"
      }`}
    >
      {label}
    </button>
  );
}

function MultiChip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
        active
          ? "bg-orange-500/20 text-orange-400 border border-orange-500/40"
          : "bg-gray-800/80 text-gray-400 hover:text-gray-300 border border-gray-700/50 hover:border-gray-600"
      }`}
    >
      {active ? "● " : ""}{label}
    </button>
  );
}

function SectionLabel({ children }) {
  return <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-2 block font-semibold">{children}</label>;
}

function PostCard({ post, index }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 space-y-2 backdrop-blur-sm">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-gray-600 bg-gray-800 px-2 py-0.5 rounded">#{index + 1}</span>
          <span className="text-sm text-white font-medium">{post.post_date}</span>
          <span className="text-[10px] text-gray-500">{post.platform} · {post.size} · {post.creative_type}</span>
        </div>
        <span className="text-gray-500 text-xs">{expanded ? "▲" : "▼"}</span>
      </div>

      <p className="text-sm text-gray-300 leading-relaxed">{post.brief}</p>

      {expanded && (
        <div className="space-y-2 pt-2 border-t border-gray-800">
          <Row label="Required Elements" value={post.required_elements} />
          <Row label="Hook" value={post.hook_archetype} />
          <Row label="ICP" value={post.icp} />
          <Row label="Tone" value={post.tone} />
          <Row label="Notes" value={post.notes} />
          <Row label="Caption" value={post.caption} />
          {post.extra_notes && <Row label="Extra Notes" value={post.extra_notes} />}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <span className="text-[10px] uppercase tracking-wider text-gray-600">{label}</span>
      <p className="text-xs text-gray-400 leading-relaxed mt-0.5">{value}</p>
    </div>
  );
}

export default function Home() {
  // Config state
  const [school, setSchool] = useState("UMA");
  const [program, setProgram] = useState(SCHOOL_PROGRAMS["UMA"][0]);
  const [platforms, setPlatforms] = useState(["Instagram"]);
  const [creativeType, setCreativeType] = useState("Organic");
  const [sizes, setSizes] = useState(["4:5"]);
  const [icps, setIcps] = useState(["Working Adult"]);
  const [tones, setTones] = useState(["Belief"]);
  const [hooks, setHooks] = useState(["Transformation"]);
  const [dateRange, setDateRange] = useState("1 Week");
  const [postCount, setPostCount] = useState(5);
  const [extraContext, setExtraContext] = useState("");

  // Output state
  const [posts, setPosts] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  const programs = SCHOOL_PROGRAMS[school] || [];

  const handleSchoolChange = (s) => {
    setSchool(s);
    setProgram(SCHOOL_PROGRAMS[s]?.[0] || "");
  };

  const toggleMulti = (arr, setArr, val) => {
    setArr((prev) => prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");
    setPosts([]);

    try {
      const res = await fetch("/api/generate-calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          school, program, platforms, creative_type: creativeType,
          sizes, icps, tones, hooks, date_range: dateRange,
          post_count: postCount, extra_context: extraContext,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPosts(data.posts);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/export-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posts, school, program }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${program.replace(/\s+/g, "_")}_content_calendar.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setExporting(false);
    }
  };

  const selectCls = "bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-orange-500/50";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6">
      <header className="mb-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-500 mb-1">Dreambound</p>
        <h1 className="text-2xl font-bold text-white leading-tight">Content Calendar Builder</h1>
        <p className="text-sm text-gray-500 mt-1">Tap to select · AI-generated briefs · Export to Google Sheets</p>
      </header>

      {/* Config Section */}
      <section className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 mb-6 space-y-5 backdrop-blur-sm">
        {/* School + Program */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <SectionLabel>School</SectionLabel>
            <select value={school} onChange={(e) => handleSchoolChange(e.target.value)} className={`${selectCls} w-full`}>
              {SCHOOLS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <SectionLabel>Program</SectionLabel>
            <select value={program} onChange={(e) => setProgram(e.target.value)} className={`${selectCls} w-full`}>
              {programs.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {/* Creative Type */}
        <div>
          <SectionLabel>Creative Type</SectionLabel>
          <div className="flex gap-2">
            {CREATIVE_TYPES.map((t) => (
              <Chip key={t} label={t} active={creativeType === t} onClick={() => setCreativeType(t)} />
            ))}
          </div>
        </div>

        {/* Platform — multi select */}
        <div>
          <SectionLabel>Platforms (select multiple)</SectionLabel>
          <div className="flex gap-2 flex-wrap">
            {PLATFORMS.map((p) => (
              <MultiChip key={p} label={p} active={platforms.includes(p)} onClick={() => toggleMulti(platforms, setPlatforms, p)} />
            ))}
          </div>
        </div>

        {/* Size — multi select */}
        <div>
          <SectionLabel>Sizes (select multiple)</SectionLabel>
          <div className="flex gap-2 flex-wrap">
            {SIZES.map((s) => (
              <MultiChip key={s} label={s} active={sizes.includes(s)} onClick={() => toggleMulti(sizes, setSizes, s)} />
            ))}
          </div>
        </div>

        {/* ICP — multi select */}
        <div>
          <SectionLabel>ICP Targets (select multiple)</SectionLabel>
          <div className="flex gap-2 flex-wrap">
            {ICPS.map((i) => (
              <MultiChip key={i} label={i} active={icps.includes(i)} onClick={() => toggleMulti(icps, setIcps, i)} />
            ))}
          </div>
        </div>

        {/* Tone — multi select */}
        <div>
          <SectionLabel>Tones (select multiple)</SectionLabel>
          <div className="flex gap-2 flex-wrap">
            {TONES.map((t) => (
              <MultiChip key={t} label={t} active={tones.includes(t)} onClick={() => toggleMulti(tones, setTones, t)} />
            ))}
          </div>
        </div>

        {/* Hook Archetype — multi select */}
        <div>
          <SectionLabel>Hook Archetypes (select multiple)</SectionLabel>
          <div className="flex gap-2 flex-wrap">
            {HOOKS.map((h) => (
              <MultiChip key={h} label={h} active={hooks.includes(h)} onClick={() => toggleMulti(hooks, setHooks, h)} />
            ))}
          </div>
        </div>

        {/* Date Range + Count */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <SectionLabel>Date Range</SectionLabel>
            <div className="flex gap-2 flex-wrap">
              {DATE_RANGES.map((d) => (
                <Chip key={d} label={d} active={dateRange === d} onClick={() => setDateRange(d)} />
              ))}
            </div>
          </div>
          <div>
            <SectionLabel>Number of Posts</SectionLabel>
            <div className="flex gap-2 flex-wrap">
              {POST_COUNTS.map((n) => (
                <Chip key={n} label={`${n}`} active={postCount === n} onClick={() => setPostCount(n)} />
              ))}
            </div>
          </div>
        </div>

        {/* Extra context */}
        <div>
          <SectionLabel>Extra Context (optional)</SectionLabel>
          <textarea
            value={extraContext}
            onChange={(e) => setExtraContext(e.target.value)}
            placeholder="Any additional direction, campaign theme, or notes..."
            rows={3}
            className="w-full bg-gray-950 border border-gray-700/50 rounded-xl px-4 py-3 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-500/50 placeholder-gray-600 resize-y"
          />
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={generating || platforms.length === 0}
            className="bg-orange-500 hover:bg-orange-400 disabled:bg-orange-800 disabled:text-gray-400 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors shadow-lg shadow-orange-500/10"
          >
            {generating ? "Generating..." : `Generate ${postCount} Posts`}
          </button>
        </div>
      </section>

      {/* Posts Output */}
      {posts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
              Content Calendar · {posts.length} posts
            </h2>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-colors"
            >
              {exporting ? "Exporting..." : "Export to CSV (Google Sheets)"}
            </button>
          </div>

          <div className="space-y-3">
            {posts.map((post, i) => (
              <PostCard key={i} post={post} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
