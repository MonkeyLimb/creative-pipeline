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
const AD_COUNTS = [1, 3, 5, 7, 10, 15];

// ─── Shared UI ───

function Chip({ label, active, onClick, size = "sm" }) {
  const pad = size === "lg" ? "px-4 py-2 text-sm" : "px-3 py-1.5 text-xs";
  return (
    <button type="button" onClick={onClick}
      className={`${pad} rounded-full font-medium transition-all duration-200 ${active
        ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25 scale-[1.02]"
        : "bg-white/[0.04] text-gray-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]"}`}>
      {label}
    </button>
  );
}

function MultiChip({ label, active, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${active
        ? "bg-orange-500/15 text-orange-400 border border-orange-500/30 shadow-sm shadow-orange-500/10"
        : "bg-white/[0.04] text-gray-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]"}`}>
      {active && <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-400 mr-1.5 relative top-[-0.5px]" />}{label}
    </button>
  );
}

function Label({ children, sub }) {
  return (
    <div className="mb-2.5">
      <label className="text-[11px] uppercase tracking-[0.12em] text-gray-400 font-semibold">{children}</label>
      {sub && <p className="text-[10px] text-gray-600 mt-0.5">{sub}</p>}
    </div>
  );
}

function Field({ label, sub, children }) {
  return <div><Label sub={sub}>{label}</Label>{children}</div>;
}

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div className="py-2 first:pt-0 last:pb-0">
      <span className="text-[10px] uppercase tracking-[0.1em] text-gray-500 font-medium">{label}</span>
      <p className="text-[13px] text-gray-300 leading-relaxed mt-1">{value}</p>
    </div>
  );
}

function Spinner() {
  return <span className="spinner" />;
}

function Badge({ children, color = "gray" }) {
  const colors = {
    gray: "bg-white/[0.06] text-gray-400 border-white/[0.08]",
    orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    violet: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  };
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${colors[color]}`}>
      {children}
    </span>
  );
}

function Card({ children, className = "" }) {
  return (
    <div className={`bg-white/[0.02] border border-white/[0.06] rounded-2xl backdrop-blur-sm ${className}`}>
      {children}
    </div>
  );
}

function PrimaryButton({ onClick, disabled, children }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="bg-orange-500 hover:bg-orange-400 active:bg-orange-600 disabled:bg-gray-800 disabled:text-gray-500 text-white font-semibold px-7 py-3 rounded-2xl text-sm transition-all duration-200 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 disabled:shadow-none flex items-center gap-2.5">
      {children}
    </button>
  );
}

function SecondaryButton({ onClick, disabled, children, color = "emerald" }) {
  const cls = {
    emerald: "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20",
    violet: "bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border-violet-500/20",
  };
  return (
    <button onClick={onClick} disabled={disabled}
      className={`${cls[color]} font-semibold px-4 py-2 rounded-xl text-xs transition-all duration-200 border disabled:opacity-40 flex items-center gap-2`}>
      {children}
    </button>
  );
}

function SchoolProgramSelect({ school, program, onSchoolChange, onProgramChange }) {
  const programs = SCHOOL_PROGRAMS[school] || [];
  const selectCls = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/30 transition-all appearance-none cursor-pointer";
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <Field label="School">
        <select value={school} onChange={(e) => onSchoolChange(e.target.value)} className={selectCls}>
          {SCHOOLS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </Field>
      <Field label="Program">
        <select value={program} onChange={(e) => onProgramChange(e.target.value)} className={selectCls}>
          {programs.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </Field>
    </div>
  );
}

// ─── Post Card ───

function PostCard({ post, index }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card className="animate-fade-up overflow-hidden">
      <div className="p-5 cursor-pointer hover:bg-white/[0.01] transition-colors" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-[10px] font-mono text-gray-500 bg-white/[0.06] px-2 py-0.5 rounded-md">{index + 1}</span>
              <span className="text-sm text-white font-semibold">{post.post_date}</span>
              <div className="flex gap-1.5">
                <Badge>{post.platform}</Badge>
                <Badge>{post.size}</Badge>
              </div>
            </div>
            <p className="text-[13px] text-gray-300 leading-relaxed">{post.brief}</p>
          </div>
          <svg className={`w-4 h-4 text-gray-500 shrink-0 mt-1 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>
      {expanded && (
        <div className="px-5 pb-5 pt-0 border-t border-white/[0.04] mt-0">
          <div className="divide-y divide-white/[0.04] pt-3">
            <Row label="Required Elements" value={post.required_elements} />
            <Row label="Hook Archetype" value={post.hook_archetype} />
            <Row label="ICP Target" value={post.icp} />
            <Row label="Tone" value={post.tone} />
            <Row label="Notes" value={post.notes} />
            <Row label="Caption" value={post.caption} />
            <Row label="AI Visual Prompt" value={post.ai_visual_prompt} />
            {post.extra_notes && <Row label="Extra Notes" value={post.extra_notes} />}
          </div>
        </div>
      )}
    </Card>
  );
}

// ─── Ad Card ───

function AdCard({ ad, index }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card className="animate-fade-up overflow-hidden">
      <div className="p-5 cursor-pointer hover:bg-white/[0.01] transition-colors" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-[10px] font-mono text-gray-500 bg-white/[0.06] px-2 py-0.5 rounded-md">{index + 1}</span>
              <Badge color="orange">{ad.hook_format}</Badge>
              <Badge color="violet">{ad.messaging_archetype}</Badge>
            </div>
            <p className="text-sm text-white font-semibold mb-1">{ad.hook_text}</p>
            <p className="text-[13px] text-gray-400 leading-relaxed">{ad.subtext}</p>
          </div>
          <svg className={`w-4 h-4 text-gray-500 shrink-0 mt-1 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>
      {expanded && (
        <div className="px-5 pb-5 pt-0 border-t border-white/[0.04]">
          <div className="divide-y divide-white/[0.04] pt-3">
            <Row label="CTA" value={ad.cta} />
            <Row label="Avatar Type" value={ad.avatar_type} />
            <Row label="Offer Angle" value={ad.offer_angle} />
            <Row label="AI Visual Prompt" value={ad.ai_visual_prompt} />
            {ad.compliance_notes && <Row label="Compliance" value={ad.compliance_notes} />}
          </div>
        </div>
      )}
    </Card>
  );
}

// ─── Calendar Tab ───

function CalendarTab() {
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
  const [posts, setPosts] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  const toggle = (arr, setArr, val) => setArr((p) => p.includes(val) ? p.filter((v) => v !== val) : [...p, val]);
  const schoolChange = (s) => { setSchool(s); setProgram(SCHOOL_PROGRAMS[s]?.[0] || ""); };

  const handleGenerate = async () => {
    setGenerating(true); setError(""); setPosts([]);
    try {
      const res = await fetch("/api/generate-calendar", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ school, program, platforms, creative_type: creativeType, sizes, icps, tones, hooks, date_range: dateRange, post_count: postCount, extra_context: extraContext }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPosts(data.posts);
    } catch (err) { setError(err.message); } finally { setGenerating(false); }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/export-csv", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ posts, school, program }) });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `${program.replace(/\s+/g, "_")}_content_calendar.csv`; a.click(); URL.revokeObjectURL(url);
    } catch (err) { setError(err.message); } finally { setExporting(false); }
  };

  return (
    <div className="space-y-8">
      <Card className="p-6 sm:p-8 space-y-6">
        <SchoolProgramSelect school={school} program={program} onSchoolChange={schoolChange} onProgramChange={setProgram} />

        <Field label="Creative Type"><div className="flex gap-2">{CREATIVE_TYPES.map((t) => <Chip key={t} label={t} active={creativeType === t} onClick={() => setCreativeType(t)} size="lg" />)}</div></Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field label="Platforms" sub="Select one or more"><div className="flex gap-2 flex-wrap">{PLATFORMS.map((p) => <MultiChip key={p} label={p} active={platforms.includes(p)} onClick={() => toggle(platforms, setPlatforms, p)} />)}</div></Field>
          <Field label="Sizes"><div className="flex gap-2 flex-wrap">{SIZES.map((s) => <MultiChip key={s} label={s} active={sizes.includes(s)} onClick={() => toggle(sizes, setSizes, s)} />)}</div></Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Field label="ICP Targets"><div className="flex gap-2 flex-wrap">{ICPS.map((i) => <MultiChip key={i} label={i} active={icps.includes(i)} onClick={() => toggle(icps, setIcps, i)} />)}</div></Field>
          <Field label="Tones"><div className="flex gap-2 flex-wrap">{TONES.map((t) => <MultiChip key={t} label={t} active={tones.includes(t)} onClick={() => toggle(tones, setTones, t)} />)}</div></Field>
          <Field label="Hook Archetypes"><div className="flex gap-2 flex-wrap">{HOOKS.map((h) => <MultiChip key={h} label={h} active={hooks.includes(h)} onClick={() => toggle(hooks, setHooks, h)} />)}</div></Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field label="Date Range"><div className="flex gap-2 flex-wrap">{DATE_RANGES.map((d) => <Chip key={d} label={d} active={dateRange === d} onClick={() => setDateRange(d)} />)}</div></Field>
          <Field label="Number of Posts"><div className="flex gap-2 flex-wrap">{POST_COUNTS.map((n) => <Chip key={n} label={`${n}`} active={postCount === n} onClick={() => setPostCount(n)} />)}</div></Field>
        </div>

        <Field label="Extra Context" sub="Optional — campaign theme, direction, notes">
          <textarea value={extraContext} onChange={(e) => setExtraContext(e.target.value)} placeholder="e.g. Back-to-school campaign, focus on affordability..." rows={3}
            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/30 placeholder-gray-600 resize-y transition-all" />
        </Field>

        {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"><p className="text-xs text-red-400">{error}</p></div>}

        <div className="flex justify-end pt-2">
          <PrimaryButton onClick={handleGenerate} disabled={generating || platforms.length === 0}>
            {generating && <Spinner />}
            {generating ? "Generating..." : `Generate ${postCount} Posts`}
          </PrimaryButton>
        </div>
      </Card>

      {posts.length > 0 && (
        <section className="space-y-5 animate-fade-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold text-white">Content Calendar</h2>
              <Badge color="green">{posts.length} posts</Badge>
            </div>
            <SecondaryButton onClick={handleExport} disabled={exporting}>
              {exporting ? <Spinner /> : <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
              {exporting ? "Exporting..." : "Export CSV"}
            </SecondaryButton>
          </div>
          <div className="space-y-3 stagger">{posts.map((post, i) => <PostCard key={i} post={post} index={i} />)}</div>
        </section>
      )}
    </div>
  );
}

// ─── Paid Ads Tab ───

function PaidAdsTab() {
  const [school, setSchool] = useState("UMA");
  const [program, setProgram] = useState(SCHOOL_PROGRAMS["UMA"][0]);
  const [platform, setPlatform] = useState("Instagram");
  const [creativeType, setCreativeType] = useState("Paid");
  const [icps, setIcps] = useState(["Working Adult"]);
  const [tones, setTones] = useState(["Recognition"]);
  const [hooks, setHooks] = useState(["Objection Flip", "Transformation"]);
  const [adCount, setAdCount] = useState(5);
  const [extraContext, setExtraContext] = useState("");
  const [ads, setAds] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const toggle = (arr, setArr, val) => setArr((p) => p.includes(val) ? p.filter((v) => v !== val) : [...p, val]);
  const schoolChange = (s) => { setSchool(s); setProgram(SCHOOL_PROGRAMS[s]?.[0] || ""); };

  const handleGenerate = async () => {
    setGenerating(true); setError(""); setAds([]);
    try {
      const res = await fetch("/api/generate-ads-csv", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ school, program, platform, creative_type: creativeType, icps, tones, hooks, ad_count: adCount, extra_context: extraContext }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAds(data.ads);
    } catch (err) { setError(err.message); } finally { setGenerating(false); }
  };

  const buildCSV = () => {
    if (!ads.length) return "";
    const h = "Program,Hook Format,Messaging Archetype,Avatar Type,Offer Angle,Hook Text,Subtext,CTA,AI Visual Prompt";
    const rows = ads.map((a) => [program, a.hook_format, a.messaging_archetype, a.avatar_type, a.offer_angle, a.hook_text, a.subtext, a.cta, a.ai_visual_prompt]
      .map((v) => `"${(v || "").replace(/"/g, '""')}"`).join(","));
    return [h, ...rows].join("\n");
  };

  const handleCopy = () => { navigator.clipboard.writeText(buildCSV()); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const handleDownload = () => {
    const blob = new Blob([buildCSV()], { type: "text/csv" }); const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${school}_${program.replace(/\s+/g, "_")}_paid_ads.csv`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <Card className="p-6 sm:p-8 space-y-6">
        <SchoolProgramSelect school={school} program={program} onSchoolChange={schoolChange} onProgramChange={setProgram} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field label="Platform"><div className="flex gap-2">{PLATFORMS.map((p) => <Chip key={p} label={p} active={platform === p} onClick={() => setPlatform(p)} />)}</div></Field>
          <Field label="Creative Type"><div className="flex gap-2">{CREATIVE_TYPES.map((t) => <Chip key={t} label={t} active={creativeType === t} onClick={() => setCreativeType(t)} />)}</div></Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Field label="ICP Targets"><div className="flex gap-2 flex-wrap">{ICPS.map((i) => <MultiChip key={i} label={i} active={icps.includes(i)} onClick={() => toggle(icps, setIcps, i)} />)}</div></Field>
          <Field label="Tones"><div className="flex gap-2 flex-wrap">{TONES.map((t) => <MultiChip key={t} label={t} active={tones.includes(t)} onClick={() => toggle(tones, setTones, t)} />)}</div></Field>
          <Field label="Hook Archetypes"><div className="flex gap-2 flex-wrap">{HOOKS.map((h) => <MultiChip key={h} label={h} active={hooks.includes(h)} onClick={() => toggle(hooks, setHooks, h)} />)}</div></Field>
        </div>

        <Field label="Number of Ads"><div className="flex gap-2 flex-wrap">{AD_COUNTS.map((n) => <Chip key={n} label={`${n}`} active={adCount === n} onClick={() => setAdCount(n)} />)}</div></Field>

        <Field label="Extra Context" sub="Optional — campaign angle, offers, seasonal hooks">
          <textarea value={extraContext} onChange={(e) => setExtraContext(e.target.value)} placeholder="e.g. Focus on career changers, highlight flexibility..." rows={3}
            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/30 placeholder-gray-600 resize-y transition-all" />
        </Field>

        {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"><p className="text-xs text-red-400">{error}</p></div>}

        <div className="flex justify-end pt-2">
          <PrimaryButton onClick={handleGenerate} disabled={generating}>
            {generating && <Spinner />}
            {generating ? "Generating..." : `Generate ${adCount} Ads`}
          </PrimaryButton>
        </div>
      </Card>

      {ads.length > 0 && (
        <section className="space-y-5 animate-fade-up">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold text-white">Paid Ad Creatives</h2>
              <Badge color="orange">{ads.length} ads</Badge>
            </div>
            <div className="flex gap-2">
              <SecondaryButton onClick={handleCopy} color="violet">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                {copied ? "Copied!" : "Copy for Claude AI"}
              </SecondaryButton>
              <SecondaryButton onClick={handleDownload}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Download CSV
              </SecondaryButton>
            </div>
          </div>

          <Card className="overflow-hidden">
            <div className="p-4 overflow-x-auto">
              <pre className="text-[11px] text-gray-400 font-mono whitespace-pre leading-relaxed">{buildCSV()}</pre>
            </div>
            <div className="px-4 py-3 border-t border-white/[0.04] bg-violet-500/[0.03]">
              <p className="text-[11px] text-violet-400/80">Paste this CSV into Claude AI chat to generate Canva designs with AI visuals.</p>
            </div>
          </Card>

          <div className="space-y-3 stagger">{ads.map((ad, i) => <AdCard key={i} ad={ad} index={i} />)}</div>
        </section>
      )}
    </div>
  );
}

// ─── Main ───

export default function Home() {
  const [activeTab, setActiveTab] = useState("calendar");

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-2 h-2 rounded-full bg-orange-500 shadow-lg shadow-orange-500/50" />
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-500">Dreambound</p>
        </div>
        <h1 className="text-3xl font-extrabold text-white leading-tight tracking-tight">Creative Pipeline</h1>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed">AI-powered content briefs and compliant ad copy for education marketing.</p>
      </header>

      <nav className="flex gap-1 mb-8 p-1 bg-white/[0.03] rounded-2xl border border-white/[0.06] w-fit">
        {[
          { id: "calendar", label: "Content Calendar" },
          { id: "ads", label: "Paid Ads CSV" },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-white/[0.08] text-white shadow-sm"
                : "text-gray-500 hover:text-gray-300"}`}>
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === "calendar" && <CalendarTab />}
      {activeTab === "ads" && <PaidAdsTab />}
    </div>
  );
}
