import { randomBytes, createHash } from "crypto";

const CLIENT_ID = process.env.CANVA_CLIENT_ID || "OC-AZ1RKS_XeaXO";
const REDIRECT_URI = "https://creative-pipeline-mu.vercel.app/api/canva-mcp-callback";
const MCP_RESOURCE = "https://mcp.canva.com/mcp";

// Same Canva OAuth endpoints, but with resource indicator for MCP
const SCOPES = "design:meta:read design:content:read design:content:write folder:read folder:write asset:read asset:write profile:read";

export async function GET() {
  const codeVerifier = randomBytes(32).toString("base64url");
  const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");

  const params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
    state: codeVerifier,
  });

  const authUrl = `https://www.canva.com/api/oauth/authorize?${params}`;
  return Response.redirect(authUrl, 302);
}
