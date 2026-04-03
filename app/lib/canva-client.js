// Canva Connect REST API client
const CANVA_API = "https://api.canva.com/rest/v1";

async function getToken() {
  // Try refreshing first
  const refreshToken = process.env.CANVA_REFRESH_TOKEN;
  const clientId = process.env.CANVA_CLIENT_ID;
  const clientSecret = process.env.CANVA_CLIENT_SECRET;

  if (refreshToken && clientId && clientSecret) {
    try {
      const res = await fetch(`${CANVA_API}/oauth/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
        },
        body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.access_token) return data.access_token;
      }
    } catch {}
  }

  const token = process.env.CANVA_ACCESS_TOKEN;
  if (!token) throw new Error("CANVA_ACCESS_TOKEN is not set");
  return token;
}

async function canvaFetch(path, options = {}) {
  const token = await getToken();
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
    throw new Error(`Canva ${res.status}: ${text.slice(0, 200)}`);
  }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("json") ? res.json() : null;
}

// Upload an image by providing raw bytes
export async function uploadAsset(imageBuffer, fileName) {
  const token = await getToken();
  const formData = new FormData();
  const blob = new Blob([imageBuffer], { type: "image/png" });
  formData.append("asset", blob, fileName || "design.png");

  const res = await fetch(`${CANVA_API}/asset-uploads`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Canva asset upload ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.job || data;
}

// Create a design import from image data URL
export async function importDesign(title, imageBase64, platform) {
  const token = await getToken();

  // Convert base64 to buffer
  const imageBuffer = Buffer.from(imageBase64, "base64");

  // Use design import with the image
  const formData = new FormData();
  const blob = new Blob([imageBuffer], { type: "image/png" });
  formData.append("import_data", blob, `${title}.png`);
  formData.append("title", title);

  const res = await fetch(`${CANVA_API}/imports`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Canva import ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.job || data;
}

// Create a design with custom dimensions
export async function createDesign(title, platform) {
  const dims = {
    instagram: { width: 1080, height: 1080 },
    facebook: { width: 940, height: 788 },
    tiktok: { width: 1080, height: 1920 },
  };
  const size = dims[platform?.toLowerCase()] || dims.instagram;
  const data = await canvaFetch("/designs", {
    method: "POST",
    body: JSON.stringify({
      design_type: { type: "custom", width: size.width, height: size.height },
      title: title || "Untitled",
    }),
  });
  return data.design || data;
}

// Get design details
export async function getDesign(designId) {
  const data = await canvaFetch(`/designs/${designId}`);
  return data.design || data;
}

// Search folders
export async function searchFolders(query) {
  try {
    const data = await canvaFetch(`/folders/search?query=${encodeURIComponent(query)}`);
    return data.items || [];
  } catch { return []; }
}

// Create folder
export async function createFolder(name) {
  const data = await canvaFetch("/folders", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  return data.folder || data;
}

// Move item to folder
export async function moveItemToFolder(itemId, folderId) {
  return canvaFetch(`/folders/${folderId}/items`, {
    method: "POST",
    body: JSON.stringify({ item_id: itemId, item_type: "design" }),
  });
}
