const REDIRECT_URI = "https://creative-pipeline-mu.vercel.app/api/canva-mcp-callback";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const stateParam = searchParams.get("state");

  if (!code || !stateParam) {
    const error = searchParams.get("error") || "No authorization code received";
    const desc = searchParams.get("error_description") || "";
    return new Response(
      `<html><body style="background:#0a0a0a;color:#f87171;font-family:monospace;padding:40px;">
        <h2>Authorization Failed</h2>
        <p>${error}</p>
        <p>${desc}</p>
      </body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  try {
    // Decode state
    const state = JSON.parse(Buffer.from(stateParam, "base64url").toString());
    const { code_verifier, client_id, token_endpoint, resource } = state;

    // Exchange code for token
    const bodyParams = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
      client_id,
      code_verifier,
    });

    // Add resource indicator if present
    if (resource) {
      bodyParams.set("resource", resource);
    }

    const tokenRes = await fetch(token_endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: bodyParams,
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || tokenData.error) {
      return new Response(
        `<html><body style="background:#0a0a0a;color:#f87171;font-family:monospace;padding:40px;">
          <h2>Token Exchange Failed</h2>
          <pre>${JSON.stringify(tokenData, null, 2)}</pre>
        </body></html>`,
        { headers: { "Content-Type": "text/html" } }
      );
    }

    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const expiresIn = tokenData.expires_in;

    return new Response(
      `<html><body style="background:#0a0a0a;color:#e5e5e5;font-family:monospace;padding:40px;max-width:700px;">
        <h2 style="color:#22c55e;">Canva MCP Authorization Successful</h2>
        <p>This token is specifically for the Canva MCP server (different from the Connect API token).</p>
        <p>Copy and set as <code style="color:#f97316;">CANVA_ACCESS_TOKEN</code> in Vercel.</p>

        <h3 style="color:#a3a3a3;margin-top:24px;">MCP Access Token</h3>
        <textarea readonly onclick="this.select()" style="width:100%;height:100px;background:#1a1a1a;color:#fbbf24;border:1px solid #333;padding:8px;font-family:monospace;font-size:11px;">${accessToken}</textarea>

        ${refreshToken ? `
        <h3 style="color:#a3a3a3;margin-top:24px;">MCP Refresh Token (set as CANVA_MCP_REFRESH_TOKEN)</h3>
        <textarea readonly onclick="this.select()" style="width:100%;height:100px;background:#1a1a1a;color:#fbbf24;border:1px solid #333;padding:8px;font-family:monospace;font-size:11px;">${refreshToken}</textarea>
        ` : ""}

        <p style="color:#737373;margin-top:16px;">Expires in: ${expiresIn} seconds</p>
        <p style="color:#737373;">Client ID (save this): ${client_id}</p>
        <p style="color:#737373;">Token endpoint: ${token_endpoint}</p>

        <h3 style="color:#a3a3a3;margin-top:24px;">Next steps:</h3>
        <ol style="color:#a3a3a3;line-height:1.8;">
          <li>Go to Vercel → Settings → Environment Variables</li>
          <li>Set <code style="color:#f97316;">CANVA_ACCESS_TOKEN</code> = the MCP access token above</li>
          ${refreshToken ? `<li>Set <code style="color:#f97316;">CANVA_MCP_REFRESH_TOKEN</code> = the MCP refresh token</li>` : ""}
          <li>Set <code style="color:#f97316;">CANVA_MCP_CLIENT_ID</code> = ${client_id}</li>
          <li>Set <code style="color:#f97316;">CANVA_MCP_TOKEN_ENDPOINT</code> = ${token_endpoint}</li>
          <li>Redeploy</li>
        </ol>
      </body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  } catch (err) {
    return new Response(
      `<html><body style="background:#0a0a0a;color:#f87171;font-family:monospace;padding:40px;">
        <h2>Error</h2>
        <pre>${err.message}</pre>
        <pre>${err.stack}</pre>
      </body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }
}
