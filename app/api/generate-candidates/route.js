import Anthropic from "@anthropic-ai/sdk";

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

Execute these steps using Canva MCP tools:
1. If Cloudinary URL is present and not "none": call upload-asset-from-url. Get asset_id.
2. Call generate-design, design_type "instagram_post", query = canva_prompt. Pass asset_ids if step 1 ran. Get job_id.
3. For EACH candidate returned by generate-design, call get-design-thumbnail to get a preview URL.

Respond ONLY with valid JSON, no markdown:
{"job_id":"...","candidates":[{"index":0,"candidate_id":"...","thumbnail_url":"..."},...],"asset_id":"...or null","error":null}`;

    const client = new Anthropic();
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 16000,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: "Generate design candidates now. Return ALL candidates with their thumbnails so the user can pick one.",
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

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock) {
      return Response.json({ error: "No text response from model" }, { status: 500 });
    }

    let result;
    try {
      result = JSON.parse(textBlock.text);
    } catch {
      result = {
        job_id: null,
        candidates: [],
        asset_id: null,
        error: "Failed to parse model response: " + textBlock.text.slice(0, 300),
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
