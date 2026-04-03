import { randomBytes, createHash } from "crypto";

const MCP_URL = "https://mcp.canva.com/mcp";
const REDIRECT_URI = "https://creative-pipeline-mu.vercel.app/api/canva-mcp-callback";

// Step 1: Discover OAuth metadata from the MCP server
async function discoverOAuth() {
  // Hit the MCP server to get 401 with resource metadata URL
  const res = await fetch(MCP_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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

  // Check for resource metadata URL in headers
  let resourceMetadataUrl = null;

  if (res.status === 401) {
    // Check WWW-Authenticate header for resource_metadata
    const wwwAuth = res.headers.get("www-authenticate") || "";
    const match = wwwAuth.match(/resource_metadata="([^"]+)"/);
    if (match) {
      resourceMetadataUrl = match[1];
    }
  }

  if (!resourceMetadataUrl) {
    // Try well-known path on the MCP server origin
    resourceMetadataUrl = "https://mcp.canva.com/.well-known/oauth-protected-resource";
  }

  // Fetch resource metadata
  const resourceRes = await fetch(resourceMetadataUrl);
  const resourceMeta = await resourceRes.json();

  // Get the authorization server URL
  let authServerUrl = null;
  if (resourceMeta.authorization_servers && resourceMeta.authorization_servers.length > 0) {
    authServerUrl = resourceMeta.authorization_servers[0];
  }

  if (!authServerUrl) {
    // Try well-known OAuth metadata from the MCP server origin
    authServerUrl = "https://mcp.canva.com";
  }

  // Fetch OAuth server metadata
  const oauthMetaUrl = `${authServerUrl}/.well-known/oauth-authorization-server`;
  const oauthRes = await fetch(oauthMetaUrl);
  const oauthMeta = await oauthRes.json();

  return { resourceMeta, oauthMeta, authServerUrl };
}

// Step 2: Dynamic Client Registration
async function registerClient(oauthMeta) {
  const regEndpoint = oauthMeta.registration_endpoint;
  if (!regEndpoint) {
    throw new Error("No registration endpoint found in OAuth metadata");
  }

  const res = await fetch(regEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_name: "Dreambound Creative Pipeline",
      redirect_uris: [REDIRECT_URI],
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      token_endpoint_auth_method: "none", // public client
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`DCR failed ${res.status}: ${text}`);
  }

  return res.json();
}

export async function GET() {
  try {
    // Discover OAuth endpoints
    const { oauthMeta, resourceMeta } = await discoverOAuth();

    // Register client dynamically
    const clientInfo = await registerClient(oauthMeta);
    const clientId = clientInfo.client_id;

    // Generate PKCE
    const codeVerifier = randomBytes(32).toString("base64url");
    const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");

    // Build state with all info needed for callback
    const state = Buffer.from(JSON.stringify({
      code_verifier: codeVerifier,
      client_id: clientId,
      token_endpoint: oauthMeta.token_endpoint,
      resource: resourceMeta.resource || MCP_URL,
    })).toString("base64url");

    // Build authorization URL
    const authEndpoint = oauthMeta.authorization_endpoint;
    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: REDIRECT_URI,
      code_challenge_method: "S256",
      code_challenge: codeChallenge,
      state,
    });

    // Add resource indicator if supported
    if (resourceMeta.resource) {
      params.set("resource", resourceMeta.resource);
    }

    // Add scopes if available
    if (oauthMeta.scopes_supported) {
      params.set("scope", oauthMeta.scopes_supported.join(" "));
    }

    return Response.redirect(`${authEndpoint}?${params}`, 302);
  } catch (error) {
    return new Response(
      `<html><body style="background:#0a0a0a;color:#f87171;font-family:monospace;padding:40px;">
        <h2>MCP OAuth Discovery Failed</h2>
        <pre>${error.message}</pre>
        <pre>${error.stack}</pre>
      </body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }
}
