const CLIENT_ID = process.env.CANVA_CLIENT_ID || "OC-AZ1RKS_XeaXO";
const CLIENT_SECRET = process.env.CANVA_CLIENT_SECRET;
const REDIRECT_URI = "https://creative-pipeline-mu.vercel.app/api/canva-callback";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const codeVerifier = searchParams.get("state"); // we stored verifier in state

  if (!CLIENT_SECRET) {
    return new Response(`<html><body style="background:#0a0a0a;color:#f87171;font-family:monospace;padding:40px;">
      <h2>Missing CANVA_CLIENT_SECRET</h2><p>Add it to Vercel Environment Variables and redeploy.</p>
    </body></html>`, { headers: { "Content-Type": "text/html" } });
  }

  if (!code) {
    const error = searchParams.get("error") || "No authorization code received";
    return new Response(`<html><body style="background:#0a0a0a;color:#f87171;font-family:monospace;padding:40px;">
      <h2>Authorization Failed</h2><p>${error}</p>
    </body></html>`, { headers: { "Content-Type": "text/html" } });
  }

  try {
    // Exchange code for access token
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
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || tokenData.error) {
      return new Response(`<html><body style="background:#0a0a0a;color:#f87171;font-family:monospace;padding:40px;">
        <h2>Token Exchange Failed</h2>
        <pre>${JSON.stringify(tokenData, null, 2)}</pre>
      </body></html>`, { headers: { "Content-Type": "text/html" } });
    }

    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const expiresIn = tokenData.expires_in;

    return new Response(`<html><body style="background:#0a0a0a;color:#e5e5e5;font-family:monospace;padding:40px;max-width:700px;">
      <h2 style="color:#22c55e;">Canva Authorization Successful</h2>
      <p>Copy the access token below and add it to your Vercel Environment Variables as <code style="color:#f97316;">CANVA_ACCESS_TOKEN</code></p>

      <h3 style="color:#a3a3a3;margin-top:24px;">Access Token</h3>
      <textarea readonly onclick="this.select()" style="width:100%;height:80px;background:#1a1a1a;color:#fbbf24;border:1px solid #333;padding:8px;font-family:monospace;font-size:12px;">${accessToken}</textarea>

      ${refreshToken ? `
      <h3 style="color:#a3a3a3;margin-top:24px;">Refresh Token (save this too — add as CANVA_REFRESH_TOKEN)</h3>
      <textarea readonly onclick="this.select()" style="width:100%;height:80px;background:#1a1a1a;color:#fbbf24;border:1px solid #333;padding:8px;font-family:monospace;font-size:12px;">${refreshToken}</textarea>
      ` : ""}

      <p style="color:#737373;margin-top:16px;">Expires in: ${expiresIn} seconds</p>

      <h3 style="color:#a3a3a3;margin-top:24px;">Next steps:</h3>
      <ol style="color:#a3a3a3;line-height:1.8;">
        <li>Go to Vercel → Settings → Environment Variables</li>
        <li>Add <code style="color:#f97316;">CANVA_ACCESS_TOKEN</code> = the access token above</li>
        ${refreshToken ? `<li>Add <code style="color:#f97316;">CANVA_REFRESH_TOKEN</code> = the refresh token above</li>` : ""}
        <li>Redeploy your app</li>
      </ol>
    </body></html>`, { headers: { "Content-Type": "text/html" } });
  } catch (err) {
    return new Response(`<html><body style="background:#0a0a0a;color:#f87171;font-family:monospace;padding:40px;">
      <h2>Error</h2><pre>${err.message}</pre>
    </body></html>`, { headers: { "Content-Type": "text/html" } });
  }
}
