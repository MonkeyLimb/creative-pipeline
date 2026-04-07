export async function POST(request) {
  try {
    const { posts, school, program, platforms } = await request.json();

    if (!posts || !posts.length) {
      return Response.json({ error: "No posts to upload" }, { status: 400 });
    }

    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
      return Response.json({ error: "Google service account not configured. Set GOOGLE_SERVICE_ACCOUNT_KEY env var in Vercel." }, { status: 500 });
    }

    const key = JSON.parse(serviceAccountKey);

    // Generate JWT for Google API auth
    const jwt = await createJWT(key);
    const accessToken = await exchangeJWTForToken(jwt);

    // Create a new spreadsheet
    const platformStr = Array.isArray(platforms) ? platforms.join(", ") : platforms || "";
    const title = `${school} - ${program} - Organic Brief${platformStr ? ` (${platformStr})` : ""}`;

    const createRes = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        properties: { title },
        sheets: [{ properties: { title: "Creative Brief" } }],
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.text();
      throw new Error(`Failed to create spreadsheet: ${err}`);
    }

    const spreadsheet = await createRes.json();
    const spreadsheetId = spreadsheet.spreadsheetId;
    const spreadsheetUrl = spreadsheet.spreadsheetUrl;

    // Build rows in the organic brief format
    const rows = [];
    posts.forEach((post, i) => {
      rows.push([`Post ${i + 1}`, "", "", "", "Links to final output"]);
      rows.push(["", "Post Brief (Description)", post.post_brief || "", "", ""]);
      rows.push(["", "Required to be in the Post", post.required_in_post || "", "", ""]);
      rows.push(["", "Size", post.size || "4:5", "", ""]);
      rows.push(["", "Notes", post.notes || "", "", ""]);
      rows.push(["", "Inspiration", post.inspiration || "", "", ""]);
      rows.push(["", "Versions", "", "", ""]);
      rows.push(["", "Caption (Fill out if empty)", post.caption || "", "", ""]);
      rows.push(["", "Extra notes", post.extra_notes || "", "", ""]);
      if (i < posts.length - 1) {
        rows.push(["", "", "", "", ""]);
        rows.push(["", "", "", "", ""]);
        rows.push(["", "", "", "", ""]);
      }
    });

    // Write data to the sheet
    const updateRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Creative%20Brief!A1?valueInputOption=RAW`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ range: "Creative Brief!A1", majorDimension: "ROWS", values: rows }),
      }
    );

    if (!updateRes.ok) {
      const err = await updateRes.text();
      throw new Error(`Failed to write data: ${err}`);
    }

    // Format: bold post headers, auto-resize columns
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [
          // Auto-resize columns
          { autoResizeDimensions: { dimensions: { sheetId: 0, dimension: "COLUMNS", startIndex: 0, endIndex: 5 } } },
          // Bold the Post header rows
          ...posts.map((_, i) => {
            const rowIndex = i * 12; // 9 data rows + 3 spacer rows
            return {
              repeatCell: {
                range: { sheetId: 0, startRowIndex: rowIndex, endRowIndex: rowIndex + 1, startColumnIndex: 0, endColumnIndex: 1 },
                cell: { userEnteredFormat: { textFormat: { bold: true, fontSize: 11 } } },
                fields: "userEnteredFormat.textFormat",
              },
            };
          }),
          // Bold the field labels (column B)
          ...posts.flatMap((_, i) => {
            const baseRow = i * 12;
            return Array.from({ length: 8 }, (__, j) => ({
              repeatCell: {
                range: { sheetId: 0, startRowIndex: baseRow + 1 + j, endRowIndex: baseRow + 2 + j, startColumnIndex: 1, endColumnIndex: 2 },
                cell: { userEnteredFormat: { textFormat: { bold: true } } },
                fields: "userEnteredFormat.textFormat",
              },
            }));
          }),
        ],
      }),
    });

    // Share with anyone who has the link (viewer)
    const driveShareRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${spreadsheetId}/permissions`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ role: "writer", type: "anyone" }),
      }
    );

    if (!driveShareRes.ok) {
      // Non-fatal: the sheet was created, just not shared publicly
      console.error("Failed to share sheet:", await driveShareRes.text());
    }

    return Response.json({ url: spreadsheetUrl, spreadsheetId });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ─── JWT Auth for Google Service Account ───

async function createJWT(key) {
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: key.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const encode = (obj) => btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const headerB64 = encode(header);
  const claimB64 = encode(claim);
  const unsignedToken = `${headerB64}.${claimB64}`;

  // Import the private key and sign
  const pemContent = key.private_key.replace(/-----BEGIN PRIVATE KEY-----/, "").replace(/-----END PRIVATE KEY-----/, "").replace(/\n/g, "");
  const binaryKey = Uint8Array.from(atob(pemContent), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, new TextEncoder().encode(unsignedToken));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  return `${unsignedToken}.${sigB64}`;
}

async function exchangeJWTForToken(jwt) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google auth failed: ${err}`);
  }

  const data = await res.json();
  return data.access_token;
}
