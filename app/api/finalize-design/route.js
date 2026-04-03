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
    const {
      school, program, platform, creative_type,
      hook, subtext, cta, canva_prompt,
      job_id, candidate_id,
    } = body;

    const disclaimer = computeDisclaimer(school, creative_type);

    const systemPrompt = `You are the Canva production assistant for Dreambound.
Program: ${program} | Platform: ${platform} | Creative type: ${creative_type}
Hook: ${hook} | Subtext: ${subtext} | CTA: ${cta}
Canva prompt: ${canva_prompt}
Disclaimer: ${disclaimer || "none"}

The user has already chosen a design candidate. Execute these steps in order using the available Canva tools:
1. Call create-design-from-candidate with job_id "${job_id}" and candidate_id "${candidate_id}". Get design_id.
2. Call start-editing-transaction with design_id.
3. Call get-design-pages.
4. Call perform-editing-operations: hook as largest dominant text, subtext below it, CTA at bottom, disclaimer as small footer text. Remove any school names, employment language, fake URLs, fake dates.
5. Call commit-editing-transaction.
6. Call search-folders for "${program}". If no result: call create-folder named "${program} — ${creative_type} — ${platform}".
7. Call move-item-to-folder with design_id and folder_id.

After completing all steps, respond ONLY with valid JSON, no markdown:
{"design_id":"...","design_url":"...","folder_url":"...","folder_name":"...","status":"success","error":null}`;

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const sessionId = await createMCPSession();
    const mcpTools = await listTools(sessionId);

    const resultText = await runAgenticLoop({
      client,
      model: "claude-sonnet-4-6",
      maxTokens: 16000,
      system: systemPrompt,
      userMessage: "Finalize the chosen design candidate now. Create the design, edit text, organize into folder.",
      sessionId,
      mcpTools,
    });

    if (!resultText) {
      return Response.json({ error: "No text response from model" }, { status: 500 });
    }

    let result;
    try {
      result = JSON.parse(resultText);
    } catch {
      result = {
        design_id: null,
        design_url: null,
        folder_url: null,
        folder_name: null,
        status: "error",
        error: "Failed to parse model response: " + resultText.slice(0, 200),
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
