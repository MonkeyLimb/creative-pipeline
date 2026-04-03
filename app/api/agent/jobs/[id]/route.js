// GET /api/agent/jobs/[id] — poll job status from agent backend or mock store

const AGENT_BASE_URL = process.env.AGENT_BASE_URL;

// Import mock store — dynamic import to share state with the POST route
// Since Next.js route segments are separate modules, we use a global store for mocks
const mockJobs = globalThis.__mockJobs || (globalThis.__mockJobs = new Map());

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // If agent backend is configured, proxy to it
    if (AGENT_BASE_URL) {
      const agentRes = await fetch(`${AGENT_BASE_URL}/v1/jobs/${id}`);

      if (!agentRes.ok) {
        const err = await agentRes.text();
        return Response.json(
          { error: `Agent error: ${err}` },
          { status: agentRes.status }
        );
      }

      const data = await agentRes.json();
      return Response.json(data);
    }

    // Check mock store
    const job = mockJobs.get(id);
    if (!job) {
      return Response.json({ error: "Job not found" }, { status: 404 });
    }

    return Response.json({
      id: job.id,
      status: job.status,
      total: job.total,
      completed: job.completed,
      failed: job.failed,
      rows: job.rows,
      mock: true,
    });
  } catch (err) {
    console.error("[agent/jobs/[id]] GET error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
