const CLIENT_ID = process.env.CANVA_CLIENT_ID || "OC-AZ1RKS_XeaXO";
const CLIENT_SECRET = process.env.CANVA_CLIENT_SECRET;
const REDIRECT_URI = "https://creative-pipeline-mu.vercel.app/api/canva-mcp-callback";
const MCP_RESOURCE = "https://mcp.canva.com/mcp";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const codeVerifier = searchParams.get("state");

  if (!CLIENT_SECRET) {
    return html("Missing CANVA_CLIENT_SECRET env var", true);
  }

  if (!code) {
    const error = searchParams.get("error") || "No authorization code";
    const desc = searchParams.get("error_description") || "";
    return html(`Authorization failed: ${error} — ${desc}`, true);
  }

  try {
    // Exchange code for token WITH resource indicator for MCP
    const tokenRes = await fetch("https://api.canva.com/rest/v1/oauth/token", {
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
        resource: MCP_RESOURCE,  // Token scoped to MCP server
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || tokenData.error) {
      // If resource parameter fails, try without it
      const fallbackRes = await fetch("https://api.canva.com/rest/v1/oauth/token", {
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

      const fallbackData = await fallbackRes.json();

      if (!fallbackRes.ok || fallbackData.error) {
        return html(`<h2>Token Exchange Failed</h2>
          <p>With resource indicator:</p>
          <pre>${JSON.stringify(tokenData, null, 2)}</pre>
          <p>Without resource indicator:</p>
          <pre>${JSON.stringify(fallbackData, null, 2)}</pre>`, true);
      }

      return renderTokens(fallbackData, "(without resource indicator — may not work with MCP)");
    }

    return renderTokens(tokenData, "(with MCP resource indicator)");
  } catch (err) {
    return html(`<h2>Error</h2><pre>${err.message}\n${err.stack}</pre>`, true);
  }
}

function renderTokens(data, note) {
  const { access_token, refresh_token, expires_in } = data;
  return html(`
    <h2 style="color:#22c55e;">Canva MCP Token Obtained ${note}</h2>
    <p>Set this as <code style="color:#f97316;">CANVA_ACCESS_TOKEN</code> in Vercel, then redeploy.</p>

    <h3 style="color:#a3a3a3;margin-top:20px;">Access Token</h3>
    <textarea readonly onclick="this.select()" style="width:100%;height:80px;background:#1a1a1a;color:#fbbf24;border:1px solid #333;padding:8px;font-family:monospace;font-size:11px;">${access_token}</textarea>
    <p style="color:#737373;">Starts with: ${access_token?.slice(0, 20)}...</p>

    ${refresh_token ? `
    <h3 style="color:#a3a3a3;margin-top:20px;">Refresh Token</h3>
    <textarea readonly onclick="this.select()" style="width:100%;height:80px;background:#1a1a1a;color:#fbbf24;border:1px solid #333;padding:8px;font-family:monospace;font-size:11px;">${refresh_token}</textarea>
    ` : ""}

    <p style="color:#737373;margin-top:12px;">Expires in: ${expires_in}s</p>

    <h3 style="color:#a3a3a3;margin-top:20px;">Vercel env vars to set:</h3>
    <ol style="color:#a3a3a3;line-height:2;">
      <li><code style="color:#f97316;">CANVA_ACCESS_TOKEN</code> = access token above</li>
      ${refresh_token ? `<li><code style="color:#f97316;">CANVA_REFRESH_TOKEN</code> = refresh token above</li>` : ""}
      <li>Redeploy</li>
    </ol>
  `);
}

function html(body, isError) {
  const color = isError ? "#f87171" : "#e5e5e5";
  return new Response(
    `<html><body style="background:#0a0a0a;color:${color};font-family:monospace;padding:40px;max-width:700px;">${body}</body></html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}
