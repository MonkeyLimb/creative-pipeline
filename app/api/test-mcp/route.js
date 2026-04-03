// Test endpoint: tries different token formats against the Canva MCP server
// This doesn't use the Anthropic API — just direct MCP calls to test auth

const MCP_URL = "https://mcp.canva.com/mcp";

async function tryMCP(token, label) {
  const attempts = [
    { label: `${label} (Bearer)`, headers: { Authorization: `Bearer ${token}` } },
    { label: `${label} (raw token in header)`, headers: { Authorization: token } },
  ];

  const results = [];

  for (const attempt of attempts) {
    try {
      const res = await fetch(MCP_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/event-stream",
          ...attempt.headers,
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "initialize",
          id: Date.now(),
          params: {
            protocolVersion: "2025-03-26",
            capabilities: {},
            clientInfo: { name: "dreambound-test", version: "1.0.0" },
          },
        }),
      });

      const text = await res.text();
      const sessionId = res.headers.get("mcp-session-id");

      results.push({
        label: attempt.label,
        status: res.status,
        sessionId,
        body: text.slice(0, 500),
        success: res.status === 200,
      });
    } catch (err) {
      results.push({
        label: attempt.label,
        status: "error",
        body: err.message,
        success: false,
      });
    }
  }

  return results;
}

export async function GET() {
  const token = process.env.CANVA_ACCESS_TOKEN;
  const results = [];

  if (token) {
    const r = await tryMCP(token, "CANVA_ACCESS_TOKEN");
    results.push(...r);
  } else {
    results.push({ label: "CANVA_ACCESS_TOKEN", status: "missing", body: "Not set", success: false });
  }

  // Also try refreshing and using fresh token
  const refreshToken = process.env.CANVA_REFRESH_TOKEN;
  const clientId = process.env.CANVA_CLIENT_ID;
  const clientSecret = process.env.CANVA_CLIENT_SECRET;

  if (refreshToken && clientId && clientSecret) {
    try {
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
      const data = await res.json();

      if (data.access_token) {
        results.push({ label: "Token refresh", status: "ok", body: `New token starts with: ${data.access_token.slice(0, 20)}...`, success: true });
        const r = await tryMCP(data.access_token, "Refreshed token");
        results.push(...r);
      } else {
        results.push({ label: "Token refresh", status: "failed", body: JSON.stringify(data), success: false });
      }
    } catch (err) {
      results.push({ label: "Token refresh", status: "error", body: err.message, success: false });
    }
  }

  const anySuccess = results.some((r) => r.success);

  const html = `<html><body style="background:#0a0a0a;color:#e5e5e5;font-family:monospace;padding:40px;max-width:900px;">
    <h2>Canva MCP Authentication Test</h2>
    <p style="color:#737373;">Testing different token formats against ${MCP_URL}</p>

    ${results.map((r) => `
      <div style="margin:16px 0;padding:12px;border:1px solid ${r.success ? '#22c55e' : '#333'};border-radius:8px;${r.success ? 'background:#052e16;' : ''}">
        <div style="display:flex;justify-content:space-between;">
          <strong>${r.label}</strong>
          <span style="color:${r.success ? '#22c55e' : '#f87171'};">${r.status}${r.sessionId ? ` (session: ${r.sessionId.slice(0, 12)}...)` : ''}</span>
        </div>
        <pre style="color:#94a3b8;font-size:11px;margin-top:8px;white-space:pre-wrap;word-break:break-all;">${r.body}</pre>
      </div>
    `).join("")}

    <h3 style="color:#a3a3a3;margin-top:24px;">${anySuccess ? "A token works! Update CANVA_ACCESS_TOKEN with the working one." : "No token format worked. The Canva MCP may require a different OAuth flow than the Connect API."}</h3>
  </body></html>`;

  return new Response(html, { headers: { "Content-Type": "text/html" } });
}
