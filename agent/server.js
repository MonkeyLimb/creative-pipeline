const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const { spawn } = require("child_process");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

// In-memory job store
const jobs = new Map();

const PORT = process.env.PORT || 4100;
const CLAUDE_PATH = process.env.CLAUDE_PATH || "claude";

// ─── Health check ───
app.get("/v1/health", (req, res) => {
  res.json({ status: "ok", jobs: jobs.size });
});

// ─── Create a new job ───
app.post("/v1/jobs", (req, res) => {
  const { school, program, platform, creative_type, rows } = req.body;

  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ error: "rows array is required" });
  }

  const id = `job_${uuidv4().slice(0, 12)}`;
  const job = {
    id,
    status: "pending",
    school,
    program,
    platform,
    creative_type,
    total: rows.length,
    completed: 0,
    failed: 0,
    rows: rows.map((r, i) => ({
      index: i,
      status: "pending",
      input: r,
      design_url: null,
      folder_url: null,
      error: null,
    })),
    created_at: new Date().toISOString(),
  };

  jobs.set(id, job);
  console.log(`[JOB] Created ${id} with ${rows.length} rows`);

  // Start processing async
  processJob(job);

  res.status(201).json({ id, status: "pending", total: rows.length });
});

// ─── Poll job status ───
app.get("/v1/jobs/:id", (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) return res.status(404).json({ error: "Job not found" });

  res.json({
    id: job.id,
    status: job.status,
    total: job.total,
    completed: job.completed,
    failed: job.failed,
    rows: job.rows.map((r) => ({
      index: r.index,
      status: r.status,
      design_url: r.design_url,
      folder_url: r.folder_url,
      error: r.error,
    })),
  });
});

// ─── Process job rows sequentially ───
async function processJob(job) {
  job.status = "running";
  console.log(`[JOB] Processing ${job.id}`);

  for (const row of job.rows) {
    try {
      row.status = "running";
      console.log(`[ROW] ${job.id} row ${row.index} starting`);

      const result = await processRow(job, row);
      row.status = "completed";
      row.design_url = result.design_url || null;
      row.folder_url = result.folder_url || null;
      job.completed++;

      console.log(`[ROW] ${job.id} row ${row.index} completed: ${row.design_url}`);
    } catch (err) {
      row.status = "failed";
      row.error = err.message;
      job.failed++;
      console.error(`[ROW] ${job.id} row ${row.index} failed: ${err.message}`);
    }
  }

  job.status = job.failed === job.total ? "failed" : "completed";
  console.log(`[JOB] ${job.id} finished — ${job.completed}/${job.total} succeeded`);
}

// ─── Process a single row via Claude CLI + Canva MCP ───
function processRow(job, row) {
  return new Promise((resolve, reject) => {
    const prompt = buildPrompt(job, row.input);

    // Shell out to claude CLI which has Canva MCP configured
    const child = spawn(CLAUDE_PATH, [
      "--print",
      "--output-format", "json",
      "--max-turns", "20",
      "--allowedTools", "mcp__canva__generate_design,mcp__canva__perform_editing_operations,mcp__canva__create_folder,mcp__canva__move_asset_to_folder,mcp__canva__get_design",
      "-p", prompt,
    ], {
      cwd: process.env.AGENT_WORK_DIR || path.join(__dirname, "workspace"),
      timeout: 300000, // 5 min per row
      env: { ...process.env },
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (d) => { stdout += d.toString(); });
    child.stderr.on("data", (d) => { stderr += d.toString(); });

    child.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(`Claude CLI exited with code ${code}: ${stderr.slice(0, 500)}`));
      }

      // Try to extract design URL from Claude's output
      const result = extractDesignUrl(stdout);
      resolve(result);
    });

    child.on("error", (err) => {
      reject(new Error(`Failed to spawn claude CLI: ${err.message}`));
    });
  });
}

// ─── Build the prompt for Claude CLI ───
function buildPrompt(job, rowInput) {
  return `You are creating a Canva design for a Dreambound ad creative.

School: ${job.school}
Program: ${job.program}
Platform: ${job.platform}
Creative Type: ${job.creative_type}

Ad Details:
- Hook Text: ${rowInput.hook_text}
- Subtext: ${rowInput.subtext}
- CTA: ${rowInput.cta}
- AI Visual Prompt: ${rowInput.ai_visual_prompt}
- Hook Format: ${rowInput.hook_format}
- Messaging Archetype: ${rowInput.messaging_archetype}

IMPORTANT: Dreambound is the only public brand. Never use the school name "${job.school}" in the design.

Steps:
1. Use the generate_design tool to create a design based on the AI Visual Prompt. Make it a ${job.platform} ad (use appropriate dimensions).
2. Use perform_editing_operations to add the hook text, subtext, and CTA text to the design.
3. Return the final design URL.

After completing, output a JSON object on a single line like this:
{"design_url": "https://www.canva.com/design/...", "folder_url": null}`;
}

// ─── Extract design URL from Claude output ───
function extractDesignUrl(output) {
  // Try to parse JSON output from --output-format json
  try {
    const parsed = JSON.parse(output);
    // Claude CLI JSON output has a "result" field
    const text = parsed.result || parsed.content || JSON.stringify(parsed);
    return extractFromText(text);
  } catch {
    // Fall back to raw text parsing
    return extractFromText(output);
  }
}

function extractFromText(text) {
  // Look for {"design_url": "..."} pattern
  const jsonMatch = text.match(/\{[^{}]*"design_url"\s*:\s*"([^"]+)"[^{}]*\}/);
  if (jsonMatch) {
    try {
      const obj = JSON.parse(jsonMatch[0]);
      return { design_url: obj.design_url, folder_url: obj.folder_url || null };
    } catch {}
  }

  // Look for canva.com/design URLs directly
  const urlMatch = text.match(/https:\/\/(?:www\.)?canva\.com\/design\/[^\s"<>)]+/);
  if (urlMatch) {
    return { design_url: urlMatch[0], folder_url: null };
  }

  // If no URL found but process succeeded, return null (design may have been created but URL not captured)
  return { design_url: null, folder_url: null };
}

// Ensure workspace directory exists
const fs = require("fs");
const workDir = process.env.AGENT_WORK_DIR || path.join(__dirname, "workspace");
if (!fs.existsSync(workDir)) fs.mkdirSync(workDir, { recursive: true });

app.listen(PORT, () => {
  console.log(`\n  Dreambound Agent Server`);
  console.log(`  ───────────────────────`);
  console.log(`  Listening on port ${PORT}`);
  console.log(`  Claude CLI: ${CLAUDE_PATH}`);
  console.log(`  Work dir:   ${workDir}`);
  console.log(`\n  Endpoints:`);
  console.log(`    GET  /v1/health`);
  console.log(`    POST /v1/jobs`);
  console.log(`    GET  /v1/jobs/:id\n`);
});
