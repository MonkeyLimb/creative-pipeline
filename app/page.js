"use client";

import { useState, useEffect } from "react";

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

// ─── Theme ───

function useTheme() {
  const [dark, setDark] = useState(true);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("theme");
      const isDark = stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
      setDark(isDark);
      document.documentElement.classList.toggle("dark", isDark);
    } catch {}
  }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
  };
  return { dark, toggle, mounted };
}

// ─── UI primitives ───

function Chip({ label, active, onClick, size = "sm" }) {
  const pad = size === "lg" ? "px-4 py-2 text-sm" : "px-3 py-1.5 text-xs";
  return (
    <button type="button" onClick={onClick}
      className={`${pad} rounded-full font-medium transition-all duration-200 cursor-pointer`}
      style={active
        ? { background: "var(--accent)", color: "#fff", boxShadow: "0 4px 14px var(--accent-glow)" }
        : { background: "var(--bg-chip)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
      {label}
    </button>
  );
}

function MultiChip({ label, active, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer"
      style={active
        ? { background: "var(--accent-soft)", color: "var(--accent)", border: "1px solid var(--accent-glow)" }
        : { background: "var(--bg-chip)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
      {active && <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", marginRight: 6, position: "relative", top: -0.5 }} />}{label}
    </button>
  );
}

function Label({ children, sub }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--text-secondary)", fontWeight: 600 }}>{children}</label>
      {sub && <p style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: 2 }}>{sub}</p>}
    </div>
  );
}

function Field({ label, sub, children }) {
  return <div><Label sub={sub}>{label}</Label>{children}</div>;
}

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ padding: "8px 0", borderBottom: "1px solid var(--border-subtle)" }}>
      <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-tertiary)", fontWeight: 500 }}>{label}</span>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginTop: 4 }}>{value}</p>
    </div>
  );
}

function Spinner() { return <span className="spinner" />; }

function Badge({ children, variant = "default" }) {
  const styles = {
    default: { background: "var(--bg-chip)", color: "var(--text-secondary)", border: "1px solid var(--border)" },
    orange: { background: "var(--accent-soft)", color: "var(--accent)", border: `1px solid var(--accent-glow)` },
    green: { background: "rgba(16,185,129,0.08)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" },
    violet: { background: "rgba(139,92,246,0.08)", color: "#8b5cf6", border: "1px solid rgba(139,92,246,0.2)" },
  };
  return (
    <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", padding: "3px 10px", borderRadius: 99, ...styles[variant] }}>
      {children}
    </span>
  );
}

function Card({ children, className = "" }) {
  return (
    <div className={className} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16 }}>
      {children}
    </div>
  );
}

function PrimaryButton({ onClick, disabled, children }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="disabled:opacity-40 flex items-center gap-2.5 cursor-pointer"
      style={{ background: disabled ? "var(--text-muted)" : "var(--accent)", color: "#fff", fontWeight: 600, padding: "12px 28px", borderRadius: 16, fontSize: 14, border: "none", boxShadow: disabled ? "none" : "0 4px 14px var(--accent-glow)", transition: "all 0.2s" }}>
      {children}
    </button>
  );
}

function SecondaryButton({ onClick, disabled, children, variant = "green" }) {
  const colors = { green: { c: "#10b981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)" }, violet: { c: "#8b5cf6", bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.2)" } };
  const s = colors[variant];
  return (
    <button onClick={onClick} disabled={disabled}
      className="disabled:opacity-40 flex items-center gap-2 cursor-pointer"
      style={{ color: s.c, background: s.bg, border: `1px solid ${s.border}`, fontWeight: 600, padding: "8px 16px", borderRadius: 12, fontSize: 12, transition: "all 0.2s" }}>
      {children}
    </button>
  );
}

function SchoolProgramSelect({ school, program, onSchoolChange, onProgramChange }) {
  const programs = SCHOOL_PROGRAMS[school] || [];
  const cls = { width: "100%", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 12, padding: "10px 16px", fontSize: 14, color: "var(--text)", outline: "none", cursor: "pointer" };
  const optCls = { background: "#1a1a2e", color: "#e5e5e5" };
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <Field label="School"><select value={school} onChange={(e) => onSchoolChange(e.target.value)} style={cls}>{SCHOOLS.map((s) => <option key={s} value={s} style={optCls}>{s}</option>)}</select></Field>
      <Field label="Program"><select value={program} onChange={(e) => onProgramChange(e.target.value)} style={cls}>{programs.map((p) => <option key={p} value={p} style={optCls}>{p}</option>)}</select></Field>
    </div>
  );
}

// ─── Theme toggle ───

function ThemeToggle({ dark, toggle }) {
  return (
    <button onClick={toggle} className="cursor-pointer"
      style={{ background: "var(--bg-chip)", border: "1px solid var(--border)", borderRadius: 12, padding: "8px 12px", color: "var(--text-secondary)", fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s" }}>
      {dark ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
      )}
      {dark ? "Light" : "Dark"}
    </button>
  );
}

// ─── How To Use ───

function HowToUse({ onDismiss }) {
  const steps = [
    { tab: "Content Calendar", steps: ["Select school and program", "Tap creative type, platforms, sizes, ICPs, tones, and hook archetypes", "Choose date range and number of posts", "Hit Generate — AI creates compliant content briefs", "Review each post (click to expand details)", "Export CSV and open in Google Sheets"] },
    { tab: "Paid Ads CSV", steps: ["Select school, program, platform, and creative type", "Tap ICP targets, tones, and hook archetypes", "Choose number of ads and hit Generate", "Review generated ad copy and AI visual prompts", "Click \"Copy for Claude AI\" to copy the CSV", "Paste into Claude AI chat to generate Canva designs"] },
  ];

  return (
    <Card className="animate-fade-up overflow-hidden mb-8">
      <div style={{ padding: "24px 28px" }}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>How to Use</h2>
            <p style={{ fontSize: 13, color: "var(--text-tertiary)", marginTop: 4 }}>Two tools, one pipeline.</p>
          </div>
          <button onClick={onDismiss} className="cursor-pointer" style={{ color: "var(--text-tertiary)", fontSize: 12, background: "var(--bg-chip)", border: "1px solid var(--border)", borderRadius: 8, padding: "4px 10px" }}>Dismiss</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((section) => (
            <div key={section.tab}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>{section.tab}</h3>
              <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {section.steps.map((step, i) => (
                  <li key={i} className="flex gap-3 items-start" style={{ marginBottom: 10 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "var(--accent)", background: "var(--accent-soft)", borderRadius: 6, padding: "2px 7px", minWidth: 22, textAlign: "center", marginTop: 1 }}>{i + 1}</span>
                    <span style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

// ─── Post Card ───

function PostCard({ post, index }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card className="animate-fade-up overflow-hidden">
      <div style={{ padding: 20, cursor: "pointer", transition: "background 0.15s" }} onClick={() => setExpanded(!expanded)}
        onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-card-hover)"}
        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-2 flex-wrap">
              <span style={{ fontSize: 10, fontFamily: "monospace", color: "var(--text-tertiary)", background: "var(--bg-chip)", padding: "2px 8px", borderRadius: 6 }}>{index + 1}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{post.post_date}</span>
              <Badge>{post.platform}</Badge>
              <Badge>{post.size}</Badge>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{post.brief}</p>
          </div>
          <svg className={`shrink-0 mt-1 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} style={{ color: "var(--text-tertiary)" }} width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>
      {expanded && (
        <div style={{ padding: "0 20px 20px", borderTop: "1px solid var(--border-subtle)" }}>
          <div style={{ paddingTop: 12 }}>
            <DetailRow label="Required Elements" value={post.required_elements} />
            <DetailRow label="Hook Archetype" value={post.hook_archetype} />
            <DetailRow label="ICP Target" value={post.icp} />
            <DetailRow label="Tone" value={post.tone} />
            <DetailRow label="Notes" value={post.notes} />
            <DetailRow label="Caption" value={post.caption} />
            <DetailRow label="AI Visual Prompt" value={post.ai_visual_prompt} />
            {post.extra_notes && <DetailRow label="Extra Notes" value={post.extra_notes} />}
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
      <div style={{ padding: 20, cursor: "pointer", transition: "background 0.15s" }} onClick={() => setExpanded(!expanded)}
        onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-card-hover)"}
        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span style={{ fontSize: 10, fontFamily: "monospace", color: "var(--text-tertiary)", background: "var(--bg-chip)", padding: "2px 8px", borderRadius: 6 }}>{index + 1}</span>
              <Badge variant="orange">{ad.hook_format}</Badge>
              <Badge variant="violet">{ad.messaging_archetype}</Badge>
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>{ad.hook_text}</p>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{ad.subtext}</p>
          </div>
          <svg className={`shrink-0 mt-1 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} style={{ color: "var(--text-tertiary)" }} width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>
      {expanded && (
        <div style={{ padding: "0 20px 20px", borderTop: "1px solid var(--border-subtle)" }}>
          <div style={{ paddingTop: 12 }}>
            <DetailRow label="CTA" value={ad.cta} />
            <DetailRow label="Avatar Type" value={ad.avatar_type} />
            <DetailRow label="Offer Angle" value={ad.offer_angle} />
            <DetailRow label="AI Visual Prompt" value={ad.ai_visual_prompt} />
            {ad.compliance_notes && <DetailRow label="Compliance" value={ad.compliance_notes} />}
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
      const blob = await res.blob(); const url = URL.createObjectURL(blob);
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
        <Field label="Extra Context" sub="Optional">
          <textarea value={extraContext} onChange={(e) => setExtraContext(e.target.value)} placeholder="Campaign theme, direction, notes..." rows={3}
            style={{ width: "100%", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 16px", fontSize: 14, color: "var(--text)", outline: "none", resize: "vertical" }} />
        </Field>
        {error && <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "10px 16px" }}><p style={{ fontSize: 12, color: "#ef4444" }}>{error}</p></div>}
        <div className="flex justify-end pt-2">
          <PrimaryButton onClick={handleGenerate} disabled={generating || platforms.length === 0}>
            {generating && <Spinner />}{generating ? "Generating..." : `Generate ${postCount} Posts`}
          </PrimaryButton>
        </div>
      </Card>
      {posts.length > 0 && (
        <section className="space-y-5 animate-fade-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3"><h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Content Calendar</h2><Badge variant="green">{posts.length} posts</Badge></div>
            <SecondaryButton onClick={handleExport} disabled={exporting}>
              {exporting ? <Spinner /> : <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
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
        <Field label="Extra Context" sub="Optional">
          <textarea value={extraContext} onChange={(e) => setExtraContext(e.target.value)} placeholder="Campaign angle, offers, seasonal hooks..." rows={3}
            style={{ width: "100%", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 16px", fontSize: 14, color: "var(--text)", outline: "none", resize: "vertical" }} />
        </Field>
        {error && <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "10px 16px" }}><p style={{ fontSize: 12, color: "#ef4444" }}>{error}</p></div>}
        <div className="flex justify-end pt-2">
          <PrimaryButton onClick={handleGenerate} disabled={generating}>
            {generating && <Spinner />}{generating ? "Generating..." : `Generate ${adCount} Ads`}
          </PrimaryButton>
        </div>
      </Card>
      {ads.length > 0 && (
        <section className="space-y-5 animate-fade-up">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3"><h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Paid Ad Creatives</h2><Badge variant="orange">{ads.length} ads</Badge></div>
            <div className="flex gap-2">
              <SecondaryButton onClick={handleCopy} variant="violet">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                {copied ? "Copied!" : "Copy for Claude AI"}
              </SecondaryButton>
              <SecondaryButton onClick={handleDownload}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Download CSV
              </SecondaryButton>
            </div>
          </div>
          <Card className="overflow-hidden">
            <div style={{ padding: 16, overflowX: "auto", background: "var(--csv-bg)" }}>
              <pre style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "monospace", whiteSpace: "pre", lineHeight: 1.6 }}>{buildCSV()}</pre>
            </div>
            <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border-subtle)", background: "var(--csv-hint-bg)" }}>
              <p style={{ fontSize: 11, color: "#8b5cf6" }}>Paste this CSV into Claude AI chat to generate Canva designs with AI visuals.</p>
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
  const { dark, toggle, mounted } = useTheme();
  const [activeTab, setActiveTab] = useState("calendar");
  const [showGuide, setShowGuide] = useState(true);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem("guide_dismissed");
      if (dismissed) setShowGuide(false);
    } catch {}
  }, []);

  const dismissGuide = () => { setShowGuide(false); localStorage.setItem("guide_dismissed", "1"); };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 12px var(--accent-glow)" }} />
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--accent)" }}>Dreambound</p>
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>Creative Pipeline</h1>
          <p style={{ fontSize: 14, color: "var(--text-tertiary)", marginTop: 8 }}>AI-powered content briefs and compliant ad copy for education marketing.</p>
        </div>
        <ThemeToggle dark={dark} toggle={toggle} />
      </header>

      {showGuide && <HowToUse onDismiss={dismissGuide} />}

      <nav className="flex gap-1 mb-8 p-1 w-fit" style={{ background: "var(--bg-chip)", borderRadius: 16, border: "1px solid var(--border)" }}>
        {[{ id: "calendar", label: "Content Calendar" }, { id: "ads", label: "Paid Ads CSV" }].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="cursor-pointer"
            style={{ padding: "10px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600, border: "none", transition: "all 0.2s",
              ...(activeTab === tab.id
                ? { background: "var(--bg-card-hover)", color: "var(--text)", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }
                : { background: "transparent", color: "var(--text-tertiary)" }) }}>
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === "calendar" && <CalendarTab />}
      {activeTab === "ads" && <PaidAdsTab />}
    </div>
  );
}
