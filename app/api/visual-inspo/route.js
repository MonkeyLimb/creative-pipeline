import Anthropic from "@anthropic-ai/sdk";

export async function POST(request) {
  try {
    const body = await request.json();
    const { images, school, program, platforms, posts_per_day, dates, date_mode, date_range, icps, tones, hooks, extra_context } = body;

    if (!images || !images.length) {
      return Response.json({ error: "At least one image is required" }, { status: 400 });
    }

    if (images.length > 3) {
      return Response.json({ error: "Maximum 3 images allowed" }, { status: 400 });
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const platformStr = Array.isArray(platforms) ? platforms.join(", ") : platforms;

    // Calculate total post count from dates × posts_per_day
    let totalPosts = 3; // default
    const ppd = posts_per_day || 1;
    if (date_mode === "dates" && dates && dates.length) {
      totalPosts = dates.length * ppd;
    } else if (date_mode === "range" && date_range && date_range.start && date_range.end) {
      const start = new Date(date_range.start);
      const end = new Date(date_range.end);
      const days = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);
      totalPosts = days * ppd;
    }

    // Build targeting context
    const icpStr = Array.isArray(icps) && icps.length ? icps.join(", ") : "";
    const toneStr = Array.isArray(tones) && tones.length ? tones.join(", ") : "";
    const hookStr = Array.isArray(hooks) && hooks.length ? hooks.join(", ") : "";
    const targetingBlock = [
      icpStr ? `- Target ICPs: ${icpStr}` : "",
      toneStr ? `- Tones: ${toneStr}` : "",
      hookStr ? `- Hook Types: ${hookStr}` : "",
      extra_context ? `- Extra Context: ${extra_context}` : "",
    ].filter(Boolean).join("\n");

    const systemPrompt = `You are an expert direct response copywriter and social media content strategist. Analyze the provided inspiration images alongside the following context:
- Program/School: ${school} — ${program}
- Campaign Focus: ${program}
- Target Platform: ${platformStr}
${targetingBlock}

Based on the visual themes and the provided context, generate an organic creative brief with ${totalPosts} post briefs.
You must output a strict JSON object with no markdown formatting.

Each post should be a standalone content piece with clear production direction for the creative team.
Vary the content across posts — use different hook types, tones, and angles to keep the feed diverse and engaging.

Output this exact JSON structure:
{
  "posts": [
    {
      "post_brief": "A clear description of the post concept and what it should communicate.",
      "required_in_post": "Specific elements that MUST be included — text overlays, music, visual style, footage type, etc.",
      "size": "4:5",
      "notes": "Additional creative direction, tips, or considerations for the designer/editor.",
      "inspiration": "",
      "versions": "",
      "caption": "",
      "extra_notes": ""
    }
  ]
}

Rules:
- Generate exactly ${totalPosts} posts in the "posts" array.
- "post_brief" should describe the content concept clearly and concisely.
- "required_in_post" should list specific production requirements (text overlays, music, footage type, visual style).
- "size" should default to "4:5" unless the platform strongly suggests otherwise.
- "notes" should include creative tips like "scroll-stopping", pacing notes, or alternative approaches.
- "inspiration" should be left as an empty string (the user will fill this in).
- "versions" should be left as an empty string.
- "caption" should be left as an empty string (the user or copywriter will fill this in).
- "extra_notes" can include scheduling reminders or cross-posting suggestions if relevant, otherwise leave empty.
- Dreambound is the ONLY brand name. Never use school names in copy.
- No employment guarantees, outcome promises, or words like "guarantee", "free", "dream career", "Fast Track".`;

    // Build content array with images and text
    const content = [];
    for (const img of images) {
      const mediaType = img.mediaType || "image/jpeg";
      content.push({
        type: "image",
        source: {
          type: "base64",
          media_type: mediaType,
          data: img.data,
        },
      });
    }
    content.push({
      type: "text",
      text: "Analyze these inspiration images and generate the organic creative brief as specified. Return ONLY the JSON object, no markdown formatting or code blocks.",
    });

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content }],
    });

    const text = response.content[0].text;
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      // Try to extract JSON from potential markdown wrapping
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        result = JSON.parse(match[0]);
      } else {
        throw new Error("Failed to parse visual inspo response");
      }
    }

    return Response.json({ result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
