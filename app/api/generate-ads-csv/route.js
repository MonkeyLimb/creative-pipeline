import Anthropic from "@anthropic-ai/sdk";

const DEGREE_SCHOOLS = ["UMA", "SNHU", "AIU", "CTU", "FSU"];

function buildSystemPrompt({ school, program, platform, creative_type }) {
  const isDegree = DEGREE_SCHOOLS.includes(school);

  return `You are a compliant paid ad copywriter and creative strategist for Dreambound.
School: ${school} | Program: ${program} | Platform: ${platform} | Creative type: ${creative_type}

COMPLIANCE RULES:
- Dreambound is the ONLY public brand. No school names in copy ever.
- No employment guarantees, outcome promises, or job placement language.
- No "guarantee", "free", "dream career", "Fast Track".
${isDegree ? `- Degree program: use "study" and "education" only. Never "train"/"training". "Career" must pair with "path" or "journey".` : `- Certificate program: "training" is acceptable.${school === "CCI" ? " Urgency language is OK." : ""}`}
${school === "FSU" ? '- Financial aid line: "Financial Aid is available for those who qualify."' : ''}
${school !== "FSU" && creative_type === "Paid" ? '- Financial aid line: "Financial aid may be available for those who qualify."' : ''}
${school === "AIU" || school === "CTU" ? '- No urgency language. Always include: "Completion times vary according to the individual student."' : ''}

Generate ad creatives. For each ad, respond with a JSON object containing:
{
  "hook_format": "the hook archetype used",
  "messaging_archetype": "the messaging archetype/tone",
  "avatar_type": "the ICP persona description",
  "offer_angle": "the specific offer angle or value prop",
  "hook_text": "the hook text / headline for the ad",
  "subtext": "supporting body copy",
  "cta": "call to action text",
  "ai_visual_prompt": "Detailed B-roll + text overlay description. We do NOT use talking-head or selfie videos. Describe: the thematic B-roll scene (setting, movement, mood, color grade, lighting), the exact on-screen text (wording, font style, placement, animation), and how they work together to stop the scroll. Be specific.",
  "pexels_query": "2-5 word search query for Pexels stock photo API. Choose evocative, literal scene descriptions (e.g. 'clean clinic room' not 'healthcare'). Avoid brand names, people's faces, text overlays. Focus on setting/environment/mood.",
  "font_color": "hex color for headline text, e.g. #FFFFFF or #1A1A2E. Pick for contrast against the likely Pexels image.",
  "font_weight": "bold or normal",
  "font_size": "integer font size in px, e.g. 48, 36, 64. Larger for short hooks, smaller for longer text.",
  "font_style": "normal or italic",
  "compliance_notes": "any compliance flags or notes"
}

Respond ONLY with a valid JSON array. No markdown, no preamble.`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { school, program, platform, creative_type, icps, tones, hooks, ad_count, extra_context } = body;

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const userMessage = `Generate exactly ${ad_count} unique paid ad creatives.

Distribute across these combinations:
- ICP targets: ${icps.join(", ")}
- Tones: ${tones.join(", ")}
- Hook archetypes: ${hooks.join(", ")}

Each ad must:
- Use a different ICP + tone + hook combination (vary as much as possible)
- Have a compelling, scroll-stopping hook
- Include a detailed AI visual prompt using B-roll + text overlay style (NO talking-head or selfie videos — we use thematic B-roll footage with bold on-screen text)
- Be fully compliant with the rules above

${extra_context ? `Additional context:\n${extra_context}` : ""}

Return exactly ${ad_count} ad objects in a JSON array.`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: buildSystemPrompt({ school, program, platform, creative_type }),
      messages: [{ role: "user", content: userMessage }],
    });

    const text = response.content[0].text;
    let ads;
    try {
      ads = JSON.parse(text);
    } catch {
      const match = text.match(/\[[\s\S]*\]/);
      if (match) {
        ads = JSON.parse(match[0]);
      } else {
        throw new Error("Failed to parse ads response");
      }
    }

    return Response.json({ ads });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
