// Canva Connect REST API client
// Direct HTTP calls — no MCP dependency

const CANVA_API = "https://api.canva.com/rest/v1";

function getToken() {
  const token = process.env.CANVA_ACCESS_TOKEN;
  if (!token) throw new Error("CANVA_ACCESS_TOKEN is not set. Add it to your Vercel Environment Variables.");
  return token;
}

async function canvaFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${CANVA_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Canva API ${res.status}: ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return null;
}

// Poll a job until it completes
async function pollJob(path, { interval = 3000, maxAttempts = 40 } = {}) {
  for (let i = 0; i < maxAttempts; i++) {
    const data = await canvaFetch(path);
    const status = data.job?.status;
    if (status === "success" || status === "completed" || status === "complete") {
      return data;
    }
    if (status === "failed") {
      throw new Error(`Job failed: ${JSON.stringify(data.job.error || data)}`);
    }
    await new Promise((r) => setTimeout(r, interval));
  }
  throw new Error("Job polling timed out");
}

// ── Asset upload ──
export async function uploadAssetFromUrl(url) {
  const data = await canvaFetch("/asset-uploads", {
    method: "POST",
    body: JSON.stringify({ url }),
  });
  // Poll for completion
  const jobId = data.job?.id;
  if (jobId) {
    const result = await pollJob(`/asset-uploads/${jobId}`);
    return result.job?.asset?.id || result.asset?.id;
  }
  return data.asset?.id;
}

// ── Design generation ──
export async function generateDesign({ designType, query, assetIds }) {
  const body = {
    design_type: designType,
    query,
  };
  if (assetIds && assetIds.length > 0) {
    body.asset_ids = assetIds;
  }

  const data = await canvaFetch("/ai/designs/generate", {
    method: "POST",
    body: JSON.stringify(body),
  });

  // Poll for design generation to complete
  const jobId = data.job?.id;
  if (!jobId) throw new Error("No job_id returned from generate-design");

  const result = await pollJob(`/ai/designs/generate/${jobId}`);
  const candidates = result.job?.result?.candidates || result.candidates || [];

  return { job_id: jobId, candidates };
}

// ── Create design from candidate ──
export async function createDesignFromCandidate(jobId, candidateId) {
  const data = await canvaFetch("/ai/designs", {
    method: "POST",
    body: JSON.stringify({
      job_id: jobId,
      candidate_id: candidateId,
    }),
  });
  return data.design;
}

// ── Get design details ──
export async function getDesign(designId) {
  return canvaFetch(`/designs/${designId}`);
}

// ── Get design thumbnail ──
export async function getDesignThumbnail(designId) {
  const data = await canvaFetch(`/designs/${designId}/thumbnail`);
  return data.thumbnail?.url || null;
}

// ── Editing operations ──
export async function startEditingTransaction(designId) {
  const data = await canvaFetch(`/designs/${designId}/editing/transaction`, {
    method: "POST",
  });
  return data.transaction?.id || data.id;
}

export async function getDesignPages(designId) {
  const data = await canvaFetch(`/designs/${designId}/pages`);
  return data.pages || data.items || [];
}

export async function performEditingOperations(designId, transactionId, operations) {
  return canvaFetch(`/designs/${designId}/editing/transaction/${transactionId}/operations`, {
    method: "POST",
    body: JSON.stringify({ operations }),
  });
}

export async function commitEditingTransaction(designId, transactionId) {
  return canvaFetch(`/designs/${designId}/editing/transaction/${transactionId}/commit`, {
    method: "POST",
  });
}

// ── Folders ──
export async function searchFolders(query) {
  const data = await canvaFetch(`/folders?query=${encodeURIComponent(query)}`);
  return data.items || data.folders || [];
}

export async function createFolder(name) {
  const data = await canvaFetch("/folders", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  return data.folder;
}

export async function moveItemToFolder(itemId, folderId) {
  return canvaFetch(`/folders/${folderId}/items`, {
    method: "POST",
    body: JSON.stringify({ item_id: itemId, item_type: "design" }),
  });
}

// ── Token refresh ──
export async function refreshAccessToken() {
  const refreshToken = process.env.CANVA_REFRESH_TOKEN;
  const clientId = process.env.CANVA_CLIENT_ID;
  const clientSecret = process.env.CANVA_CLIENT_SECRET;

  if (!refreshToken || !clientId || !clientSecret) {
    throw new Error("Missing CANVA_REFRESH_TOKEN, CANVA_CLIENT_ID, or CANVA_CLIENT_SECRET for token refresh");
  }

  const res = await fetch("https://api.canva.com/rest/v1/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token refresh failed: ${text}`);
  }

  return res.json();
}
