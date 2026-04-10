// POST /api/phase-c-row — Process one row for Phase C: Pexels image fetch + Canva MCP styling
// Processes sequentially (UI calls one at a time). Canva semaphore capped at 1.

const AGENT_BASE_URL = process.env.AGENT_BASE_URL; // e.g. http://your-vps:4100

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      row_index,
      program,
      school,
      platform,
      design_id,
      pexels_query,
      font_color,
      font_weight,
      font_size,
      font_style,
      hook_text,
    } = body;

    if (!pexels_query) {
      return Response.json({ error: "pexels_query is required" }, { status: 400 });
    }

    // ─── Step 1: Hit Pexels API ───
    const pexelsKey = process.env.PEXELS_API_KEY;
    let pexelsUrl = null;
    let pexelsPhotographer = null;

    if (pexelsKey) {
      const pexelsRes = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(pexels_query)}&per_page=1`,
        { headers: { Authorization: pexelsKey } }
      );

      if (!pexelsRes.ok) {
        const errText = await pexelsRes.text();
        return Response.json(
          { error: `Pexels API ${pexelsRes.status}: ${errText.slice(0, 200)}` },
          { status: 502 }
        );
      }

      const pexelsData = await pexelsRes.json();
      if (pexelsData.photos && pexelsData.photos.length > 0) {
        pexelsUrl = pexelsData.photos[0].src.original;
        pexelsPhotographer = pexelsData.photos[0].photographer || null;
      } else {
        return Response.json(
          { error: `No Pexels results for query: "${pexels_query}"` },
          { status: 404 }
        );
      }
    } else {
      // No Pexels API key — return guidance
      return Response.json(
        {
          error: "PEXELS_API_KEY not configured. Add it to .env.local to enable Phase C image fetching.",
          fallback: true,
          pexels_query,
        },
        { status: 422 }
      );
    }

    // ─── Steps 2–6: Canva MCP operations via agent server ───
    // If no design_id, we can still return the Pexels URL for manual use
    if (!design_id) {
      return Response.json({
        row_index,
        pexels_url: pexelsUrl,
        pexels_photographer: pexelsPhotographer,
        design_id: null,
        status: "pexels_only",
        message: "No design_id provided — Pexels image fetched but Canva operations skipped. Run Phase B first to get design IDs.",
      });
    }

    // If agent backend is configured, send Phase C job for Canva MCP operations
    if (AGENT_BASE_URL) {
      const agentRes = await fetch(`${AGENT_BASE_URL}/v1/phase-c`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          row_index,
          design_id,
          pexels_url: pexelsUrl,
          font_color: font_color || "#FFFFFF",
          font_weight: font_weight || "bold",
          font_size: Number(font_size) || 48,
          font_style: font_style || "normal",
          program,
          school,
          platform,
          hook_text,
        }),
      });

      if (!agentRes.ok) {
        const errText = await agentRes.text();
        return Response.json(
          {
            row_index,
            pexels_url: pexelsUrl,
            pexels_photographer: pexelsPhotographer,
            design_id,
            status: "pexels_only",
            agent_error: `Agent error: ${errText.slice(0, 200)}`,
            message: "Pexels image fetched but Canva agent failed. Image URL available for manual use.",
          },
          { status: 207 }
        );
      }

      const agentData = await agentRes.json();
      return Response.json({
        row_index,
        pexels_url: pexelsUrl,
        pexels_photographer: pexelsPhotographer,
        design_id,
        canva_asset_id: agentData.asset_id || null,
        status: "completed",
      });
    }

    // No agent configured — return Pexels result for manual Canva workflow
    return Response.json({
      row_index,
      pexels_url: pexelsUrl,
      pexels_photographer: pexelsPhotographer,
      design_id,
      status: "pexels_only",
      message: "Pexels image fetched. AGENT_BASE_URL not configured — paste the Canva MCP prompt below into Claude Chat to complete the design.",
      canva_prompt: buildCanvaMCPPrompt({ design_id, pexels_url: pexelsUrl, font_color, font_weight, font_size, font_style }),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

function buildCanvaMCPPrompt({ design_id, pexels_url, font_color, font_weight, font_size, font_style }) {
  return `## Phase C: Apply Pexels Image + Font Styling

1. Upload this image to Canva:
   - Use upload-asset-from-url with url: "${pexels_url}"

2. Open the design for editing:
   - Use start-editing-transaction with design_id: "${design_id}"

3. Swap all editable image fills:
   - Use perform-editing-operations with type: update_fill
   - Apply the uploaded asset to all fills where editable: true

4. Apply font styling to all text elements:
   - Use perform-editing-operations with type: format_text
   - color: "${font_color}"
   - font_weight: "${font_weight}"
   - font_size: ${font_size}
   - font_style: "${font_style}"
   - Apply to all richtext element_ids from the transaction

5. Commit the changes:
   - Use commit-editing-transaction`;
}
