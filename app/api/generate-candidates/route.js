import Anthropic from "@anthropic-ai/sdk";
import { createMCPSession, listTools, runAgenticLoop } from "../../lib/mcp-client.js";

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

    const systemPrompt = `You are the Canva design candidate generator for Dreambound.
Program: ${program} | Platform: ${platform} | Creative type: ${creative_type}
Hook: ${hook} | Subtext: ${subtext} | CTA: ${cta}
Canva prompt: ${canva_prompt}
Cloudinary URL: ${cloudinary_url || "none"}
Disclaimer: ${disclaimer || "none"}

Execute these steps using the available Canva tools:
1. If Cloudinary URL is present and not "none": call upload-asset-from-url. Get asset_id.
2. Call generate-design, design_type "instagram_post", query = canva_prompt. Pass asset_ids if step 1 ran. Get job_id.
3. For EACH candidate returned by generate-design, call get-design-thumbnail to get a preview URL.

After completing all steps, respond ONLY with valid JSON, no markdown:
{"job_id":"...","candidates":[{"index":0,"candidate_id":"...","thumbnail_url":"..."},...],"asset_id":"...or null","error":null}`;

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const sessionId = await createMCPSession();
    const mcpTools = await listTools(sessionId);

    const resultText = await runAgenticLoop({
      client,
      model: "claude-sonnet-4-6",
      maxTokens: 16000,
      system: systemPrompt,
      userMessage: "Generate design candidates now. Return ALL candidates with their thumbnails so the user can pick one.",
      sessionId,
      mcpTools,
    });

    if (!resultText) {
      return Response.json({ job_id: null, candidates: [], asset_id: null, error: "No text response from model" }, { status: 500 });
    }

    let result;
    try {
      result = JSON.parse(resultText);
    } catch {
      result = {
        job_id: null,
        candidates: [],
        asset_id: null,
        error: "Failed to parse model response: " + resultText.slice(0, 300),
      };
    }

    return Response.json(result);
  } catch (error) {
    return Response.json(
      { job_id: null, candidates: [], asset_id: null, error: error.message },
      { status: 500 }
    );
  }
}
