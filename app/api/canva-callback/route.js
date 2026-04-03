const CLIENT_ID = process.env.CANVA_CLIENT_ID || "OC-AZ1RKS_XeaXO";
const CLIENT_SECRET = process.env.CANVA_CLIENT_SECRET;
const REDIRECT_URI = "https://creative-pipeline-mu.vercel.app/api/canva-callback";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const codeVerifier = searchParams.get("state");

  if (!CLIENT_SECRET) {
    return html("<h2>Missing CANVA_CLIENT_SECRET</h2><p>Add it to Vercel env vars.</p>", true);
  }

  if (!code) {
    const error = searchParams.get("error") || "No authorization code";
    const desc = searchParams.get("error_description") || "";
    return html(`<h2>Authorization Failed</h2><p>${error}</p><p>${desc}</p>`, true);
  }

  try {
    const res = await fetch("https://api.canva.com/rest/v1/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
        code_verifier: codeVerifier,
      }),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      return html(`<h2>Token Exchange Failed</h2><pre>${JSON.stringify(data, null, 2)}</pre>`, true);
    }

    return html(`
      <h2 style="color:#22c55e;">Token Obtained</h2>

      <h3 style="color:#a3a3a3;margin-top:20px;">Access Token</h3>
      <textarea readonly onclick="this.select()" style="width:100%;height:80px;background:#1a1a1a;color:#fbbf24;border:1px solid #333;padding:8px;font-family:monospace;font-size:11px;">${data.access_token}</textarea>

      ${data.refresh_token ? `
      <h3 style="color:#a3a3a3;margin-top:20px;">Refresh Token</h3>
      <textarea readonly onclick="this.select()" style="width:100%;height:80px;background:#1a1a1a;color:#fbbf24;border:1px solid #333;padding:8px;font-family:monospace;font-size:11px;">${data.refresh_token}</textarea>
      ` : ""}

      <p style="color:#737373;margin-top:12px;">Expires in: ${data.expires_in}s</p>

      <h3 style="color:#a3a3a3;margin-top:20px;">Set in Vercel, then redeploy:</h3>
      <ol style="color:#a3a3a3;line-height:2;">
        <li><code style="color:#f97316;">CANVA_ACCESS_TOKEN</code> = access token</li>
        ${data.refresh_token ? `<li><code style="color:#f97316;">CANVA_REFRESH_TOKEN</code> = refresh token</li>` : ""}
      </ol>
    `);
  } catch (err) {
    return html(`<h2>Error</h2><pre>${err.message}</pre>`, true);
  }
}

function html(body, isError) {
  const color = isError ? "#f87171" : "#e5e5e5";
  return new Response(
    `<html><body style="background:#0a0a0a;color:${color};font-family:monospace;padding:40px;max-width:700px;">${body}</body></html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}
