// POST /api/agent/jobs — proxy to agent backend or use mock
// Accepts ad rows from the web UI and forwards to the agent for Canva design generation

const AGENT_BASE_URL = process.env.AGENT_BASE_URL; // e.g. http://your-vps:4100

// ─── Mock job store (shared via globalThis so the [id] route can read it) ───
const mockJobs = globalThis.__mockJobs || (globalThis.__mockJobs = new Map());

function createMockJob(body) {
  const id = `job_mock_${Date.now().toString(36)}`;
  const job = {
    id,
    status: "running",
    total: body.rows.length,
    completed: 0,
    failed: 0,
    rows: body.rows.map((_, i) => ({
      index: i,
      status: "pending",
      design_url: null,
      folder_url: null,
      error: null,
    })),
  };
  mockJobs.set(id, job);

  // Simulate rows completing over time (3s per row)
  let current = 0;
  const interval = setInterval(() => {
    if (current >= job.rows.length) {
      clearInterval(interval);
      job.status = "completed";
      return;
    }
    job.rows[current].status = "completed";
    job.rows[current].design_url = `https://www.canva.com/design/mock-${id}-row${current}/view`;
    job.completed++;
    current++;
  }, 3000);

  return job;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { school, program, platform, creative_type, rows } = body;

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return Response.json({ error: "rows array is required" }, { status: 400 });
    }

    // If agent backend is configured, proxy to it
    if (AGENT_BASE_URL) {
      const agentRes = await fetch(`${AGENT_BASE_URL}/v1/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ school, program, platform, creative_type, rows }),
      });

      if (!agentRes.ok) {
        const err = await agentRes.text();
        return Response.json(
          { error: `Agent error: ${err}` },
          { status: agentRes.status }
        );
      }

      const data = await agentRes.json();
      return Response.json(data, { status: 201 });
    }

    // No agent configured — use mock
    const job = createMockJob(body);
    return Response.json(
      { id: job.id, status: job.status, total: job.total, mock: true },
      { status: 201 }
    );
  } catch (err) {
    console.error("[agent/jobs] POST error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// Export mockJobs so the [id] route can access it
export { mockJobs };
