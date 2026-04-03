import Anthropic from "@anthropic-ai/sdk";

const DEGREE_SCHOOLS = ["UMA", "SNHU", "AIU", "CTU", "FSU"];

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

function buildSystemPrompt({ program, platform, creative_type, hook, subtext, cta, canva_prompt, cloudinary_url, disclaimer }) {
  return `You are the Canva production assistant for Dreambound.
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
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { school, program, platform, creative_type, hook, subtext, cta, canva_prompt, cloudinary_url } = body;

    const client = new Anthropic();
    const disclaimer = computeDisclaimer(school, creative_type);

    const systemPrompt = buildSystemPrompt({
      program,
      platform,
      creative_type,
      hook,
      subtext,
      cta,
      canva_prompt,
      cloudinary_url,
      disclaimer,
    });

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 16000,
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

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock) {
      return Response.json({ error: "No text response from model" }, { status: 500 });
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
