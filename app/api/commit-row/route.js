import Anthropic from "@anthropic-ai/sdk";

// Get a fresh Canva MCP token — try MCP-specific refresh first, then Connect API refresh
async function getCanvaToken() {
  // Try MCP-specific token refresh (from /api/canva-mcp-auth flow)
  const mcpRefresh = process.env.CANVA_MCP_REFRESH_TOKEN;
  const mcpClientId = process.env.CANVA_MCP_CLIENT_ID;
  const mcpTokenEndpoint = process.env.CANVA_MCP_TOKEN_ENDPOINT;

  if (mcpRefresh && mcpClientId && mcpTokenEndpoint) {
    try {
      const res = await fetch(mcpTokenEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: mcpRefresh,
          client_id: mcpClientId,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.access_token) return data.access_token;
      }
    } catch (err) {
      console.error("MCP token refresh failed:", err.message);
    }
  }

  // Fallback: try Connect API refresh
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
      if (res.ok) {
        const data = await res.json();
        if (data.access_token) return data.access_token;
      }
    } catch (err) {
      console.error("Connect API token refresh failed:", err.message);
    }
  }

  // Final fallback: stored token
  const token = process.env.CANVA_ACCESS_TOKEN;
  if (!token) throw new Error("No CANVA_ACCESS_TOKEN available and all refresh attempts failed");
  return token;
}

function computeDisclaimer(school, creative_type) {
  if (creative_type === "Organic") return "";
  const lines = [];
  if (school === "FSU") {
    lines.push("Financial Aid is available for those who qualify.");
  } else {
    lines.push("Financial aid may be available for those who qualify.");
  }
  if (school === "AIU" || school === "CTU") {
    lines.push("Completion times vary according to the individual student.");
  }
  return lines.join(" ");
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { school, program, platform, creative_type, hook, subtext, cta, canva_prompt, cloudinary_url } = body;

    const disclaimer = computeDisclaimer(school, creative_type);

    const systemPrompt = `You are the Canva production assistant for Dreambound.
Program: ${program} | Platform: ${platform} | Creative type: ${creative_type}
Hook: ${hook} | Subtext: ${subtext} | CTA: ${cta}
Canva prompt: ${canva_prompt}
Cloudinary URL: ${cloudinary_url || "none"}
Disclaimer: ${disclaimer || "none"}

Execute in order using Canva MCP tools:
1. If Cloudinary URL is present: call upload-asset-from-url. Get asset_id.
2. Call generate-design, design_type "instagram_post", query = canva_prompt. Pass asset_ids if step 1 ran. Take candidate at index 0. Get job_id and candidate_id.
3. Call create-design-from-candidate with job_id and candidate_id.
4. Call start-editing-transaction with design_id.
5. Call get-design-pages.
6. Call perform-editing-operations: hook as largest dominant text, subtext below it, CTA at bottom, disclaimer as small footer text. Remove any school names, employment language, fake URLs, fake dates.
7. Call commit-editing-transaction.
8. Call search-folders for "${program}". If no result: call create-folder named "${program} — ${creative_type} — ${platform}".
9. Call move-item-to-folder with design_id and folder_id.

Respond ONLY with valid JSON, no markdown:
{"design_id":"...","design_url":"...","folder_url":"...","folder_name":"...","status":"success","error":null}`;

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    // Try with latest beta, no authorization_token (Anthropic may handle Canva auth)
    // If that fails, try with token
    let response;
    try {
      response = await client.beta.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 16000,
        betas: ["mcp-client-2025-11-20"],
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: "Execute the Canva production pipeline now. Follow each step in order using the MCP tools.",
          },
        ],
        mcp_servers: [
          {
            type: "url",
            url: "https://mcp.canva.com/mcp",
            name: "canva",
          },
        ],
      });
    } catch (firstErr) {
      // If no-token fails, try with token
      const canvaToken = await getCanvaToken();
      response = await client.beta.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 16000,
        betas: ["mcp-client-2025-11-20"],
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: "Execute the Canva production pipeline now. Follow each step in order using the MCP tools.",
          },
        ],
        mcp_servers: [
          {
            type: "url",
            url: "https://mcp.canva.com/mcp",
            name: "canva",
            authorization_token: canvaToken,
          },
        ],
      });
    }
    });

    // Find the last text block in the response
    const textBlocks = response.content.filter((b) => b.type === "text");
    const textBlock = textBlocks.length > 0 ? textBlocks[textBlocks.length - 1] : null;

    if (!textBlock) {
      return Response.json(
        { design_id: null, design_url: null, folder_url: null, folder_name: null, status: "error", error: "No text response from model" },
        { status: 500 }
      );
    }

    let result;
    try {
      result = JSON.parse(textBlock.text);
    } catch {
      result = {
        design_id: null,
        design_url: null,
        folder_url: null,
        folder_name: null,
        status: "error",
        error: "Failed to parse model response: " + textBlock.text.slice(0, 200),
      };
    }

    return Response.json(result);
  } catch (error) {
    return Response.json(
      {
        design_id: null,
        design_url: null,
        folder_url: null,
        folder_name: null,
        status: "error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
