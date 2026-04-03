import { randomBytes, createHash } from "crypto";

const MCP_URL = "https://mcp.canva.com/mcp";
const MCP_ORIGIN = "https://mcp.canva.com";
const REDIRECT_URI = "https://creative-pipeline-mu.vercel.app/api/canva-mcp-callback";

// Helper to fetch JSON with error details
async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  const text = await res.text();
  const headers = {};
  res.headers.forEach((v, k) => { headers[k] = v; });

  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }

  return { status: res.status, text, json, headers };
}

export async function GET() {
  const debug = [];

  try {
    // Step 1: Hit MCP server to discover OAuth
    debug.push("Step 1: Hitting MCP server...");

    const mcpRes = await fetchJSON(MCP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "initialize",
        id: 1,
        params: {
          protocolVersion: "2025-03-26",
          capabilities: {},
          clientInfo: { name: "dreambound-pipeline", version: "1.0.0" },
        },
      }),
    });

    debug.push(`MCP response: ${mcpRes.status}`);
    debug.push(`MCP headers: ${JSON.stringify(mcpRes.headers, null, 2)}`);
    debug.push(`MCP body (first 500): ${mcpRes.text.slice(0, 500)}`);

    // Extract resource_metadata from WWW-Authenticate header
    let resourceMetadataUrl = null;
    const wwwAuth = mcpRes.headers["www-authenticate"] || "";
    debug.push(`WWW-Authenticate: ${wwwAuth}`);

    const resourceMatch = wwwAuth.match(/resource_metadata="([^"]+)"/);
    if (resourceMatch) {
      resourceMetadataUrl = resourceMatch[1];
      debug.push(`Found resource_metadata URL: ${resourceMetadataUrl}`);
    }

    // Try well-known paths if no header
    if (!resourceMetadataUrl) {
      const wellKnownUrls = [
        `${MCP_ORIGIN}/.well-known/oauth-protected-resource`,
        `${MCP_ORIGIN}/.well-known/openid-configuration`,
      ];

      for (const url of wellKnownUrls) {
        debug.push(`Trying: ${url}`);
        const r = await fetchJSON(url);
        debug.push(`  Status: ${r.status}, Has JSON: ${!!r.json}`);
        if (r.json && r.json.authorization_servers) {
          resourceMetadataUrl = url;
          debug.push(`  Found authorization_servers: ${JSON.stringify(r.json.authorization_servers)}`);

          // Get auth server
          const authServer = r.json.authorization_servers[0];
          const oauthMetaUrl = `${authServer}/.well-known/oauth-authorization-server`;
          debug.push(`Fetching OAuth metadata: ${oauthMetaUrl}`);

          const oauthRes = await fetchJSON(oauthMetaUrl);
          debug.push(`  Status: ${oauthRes.status}, Has JSON: ${!!oauthRes.json}`);

          if (oauthRes.json) {
            return await doAuth(oauthRes.json, r.json, debug);
          }
        }
        if (r.json && r.json.authorization_endpoint) {
          // This IS the OAuth metadata
          return await doAuth(r.json, { resource: MCP_URL }, debug);
        }
      }
    }

    if (resourceMetadataUrl) {
      debug.push(`Fetching resource metadata: ${resourceMetadataUrl}`);
      const resourceRes = await fetchJSON(resourceMetadataUrl);
      debug.push(`  Status: ${resourceRes.status}, Body: ${resourceRes.text.slice(0, 300)}`);

      if (resourceRes.json && resourceRes.json.authorization_servers) {
        const authServer = resourceRes.json.authorization_servers[0];
        const oauthMetaUrl = `${authServer}/.well-known/oauth-authorization-server`;
        debug.push(`Fetching OAuth metadata: ${oauthMetaUrl}`);

        const oauthRes = await fetchJSON(oauthMetaUrl);
        debug.push(`  Status: ${oauthRes.status}, Body: ${oauthRes.text.slice(0, 300)}`);

        if (oauthRes.json) {
          return await doAuth(oauthRes.json, resourceRes.json, debug);
        }
      }
    }

    // Nothing worked — show debug
    return renderDebug("Could not discover OAuth endpoints", debug);

  } catch (error) {
    debug.push(`Error: ${error.message}`);
    debug.push(error.stack);
    return renderDebug("OAuth Discovery Failed", debug);
  }
}

async function doAuth(oauthMeta, resourceMeta, debug) {
  debug.push(`OAuth metadata keys: ${Object.keys(oauthMeta).join(", ")}`);
  debug.push(`Authorization endpoint: ${oauthMeta.authorization_endpoint}`);
  debug.push(`Token endpoint: ${oauthMeta.token_endpoint}`);
  debug.push(`Registration endpoint: ${oauthMeta.registration_endpoint}`);

  // Dynamic Client Registration
  const regEndpoint = oauthMeta.registration_endpoint;
  if (!regEndpoint) {
    return renderDebug("No registration_endpoint in OAuth metadata", debug);
  }

  debug.push(`Registering client at: ${regEndpoint}`);
  const regRes = await fetchJSON(regEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_name: "Dreambound Creative Pipeline",
      redirect_uris: [REDIRECT_URI],
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      token_endpoint_auth_method: "none",
    }),
  });

  debug.push(`Registration status: ${regRes.status}`);
  debug.push(`Registration body: ${regRes.text.slice(0, 500)}`);

  if (!regRes.json || !regRes.json.client_id) {
    return renderDebug("Client registration failed", debug);
  }

  const clientId = regRes.json.client_id;
  debug.push(`Client ID: ${clientId}`);

  // PKCE
  const codeVerifier = randomBytes(32).toString("base64url");
  const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");

  // State
  const state = Buffer.from(JSON.stringify({
    code_verifier: codeVerifier,
    client_id: clientId,
    token_endpoint: oauthMeta.token_endpoint,
    resource: resourceMeta.resource || MCP_URL,
  })).toString("base64url");

  // Build auth URL
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
    state,
  });

  if (resourceMeta.resource) {
    params.set("resource", resourceMeta.resource);
  }

  if (oauthMeta.scopes_supported) {
    params.set("scope", oauthMeta.scopes_supported.join(" "));
  }

  const authUrl = `${oauthMeta.authorization_endpoint}?${params}`;
  debug.push(`Redirecting to: ${authUrl}`);

  return Response.redirect(authUrl, 302);
}

function renderDebug(title, debug) {
  return new Response(
    `<html><body style="background:#0a0a0a;color:#e5e5e5;font-family:monospace;padding:40px;max-width:900px;">
      <h2 style="color:#f87171;">${title}</h2>
      <h3 style="color:#a3a3a3;">Debug log:</h3>
      <pre style="white-space:pre-wrap;word-break:break-all;color:#94a3b8;font-size:12px;line-height:1.6;">${debug.join("\n\n")}</pre>
    </body></html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}
