// Canva Connect REST API client
// Uses documented endpoints at api.canva.com/rest/v1

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

// Design type presets for platforms
const DESIGN_PRESETS = {
  instagram: "instagram_post",       // 1080x1080
  facebook: "facebook_post",         // 940x788
  tiktok: "tiktok_video",           // 1080x1920
};

// ── Create a blank design ──
export async function createDesign({ title, platform }) {
  const presetName = DESIGN_PRESETS[platform?.toLowerCase()] || "instagram_post";
  const data = await canvaFetch("/designs", {
    method: "POST",
    body: JSON.stringify({
      design_type: {
        type: "preset",
        name: presetName,
      },
      title: title || "Untitled Design",
    }),
  });
  return data.design;
}

// ── Get design details ──
export async function getDesign(designId) {
  const data = await canvaFetch(`/designs/${designId}`);
  return data.design || data;
}

// ── List folders (search by name) ──
export async function searchFolders(query) {
  try {
    const data = await canvaFetch(`/folders/search?query=${encodeURIComponent(query)}`);
    return data.items || [];
  } catch (err) {
    // search endpoint may not exist — try listing
    if (err.message.includes("404")) {
      return [];
    }
    throw err;
  }
}

// ── Create a folder ──
export async function createFolder(name) {
  const data = await canvaFetch("/folders", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  return data.folder || data;
}

// ── Move item to folder ──
export async function moveItemToFolder(itemId, folderId) {
  return canvaFetch(`/folders/${folderId}/items`, {
    method: "POST",
    body: JSON.stringify({
      item_id: itemId,
      item_type: "design",
    }),
  });
}

// ── Upload asset from URL ──
export async function uploadAssetFromUrl(url) {
  const data = await canvaFetch("/asset-uploads", {
    method: "POST",
    body: JSON.stringify({ url }),
  });
  return data.job?.id || data.asset?.id || null;
}

// ── Export design (get a PNG/PDF) ──
export async function exportDesign(designId, format = "png") {
  const data = await canvaFetch(`/designs/${designId}/exports`, {
    method: "POST",
    body: JSON.stringify({
      format,
    }),
  });
  return data;
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
