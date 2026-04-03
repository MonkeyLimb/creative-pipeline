import Anthropic from "@anthropic-ai/sdk";

function computeDisclaimer(school, creative_type) {
  if (creative_type === "Organic") return "";
  const lines = [];
  if (school === "FSU") lines.push("Financial Aid is available for those who qualify.");
  else lines.push("Financial aid may be available for those who qualify.");
  if (school === "AIU" || school === "CTU") lines.push("Completion times vary according to the individual student.");
  return lines.join(" ");
}

const DEGREE_SCHOOLS = ["UMA", "SNHU", "AIU", "CTU", "FSU"];

function buildSystemPrompt({ school, program, creative_type }) {
  const isDegree = DEGREE_SCHOOLS.includes(school);
  const disclaimer = computeDisclaimer(school, creative_type);

  return `You are a content strategist for Dreambound, an education marketplace.
You create detailed social media content briefs that are compliant, creative, and on-brand.

School: ${school} | Program: ${program} | Creative type: ${creative_type}
${disclaimer ? `Disclaimer to include: "${disclaimer}"` : ""}

COMPLIANCE RULES:
- Dreambound is the ONLY public brand. No school names in any content.
- No employment guarantees, outcome promises, or job placement language.
- No "guarantee", "free", "dream career", "Fast Track".
${isDegree ? `- Degree program: use "study" and "education" only. Never "train"/"training". "Career" must pair with "path" or "journey".` : `- Certificate program: "training" is acceptable.${school === "CCI" ? " Urgency language is OK." : ""}`}
${school === "AIU" || school === "CTU" ? "- No urgency language." : ""}

Respond ONLY in valid JSON array. No markdown, no preamble. Each object:
{
  "post_date": "YYYY-MM-DD",
  "platform": "...",
  "creative_type": "${creative_type}",
  "size": "...",
  "hook_archetype": "...",
  "icp": "...",
  "tone": "...",
  "brief": "1-2 sentence post brief/description",
  "required_elements": "What must be visually in the post (text style, music, b-roll direction)",
  "notes": "Production notes, scroll-stopping tips, style direction",
  "caption": "Full compliant caption with hashtags",
  "ai_visual_prompt": "Detailed visual description for AI image/video generation",
  "extra_notes": "Any additional reminders (e.g. post to Story, boost, etc.)"
}`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      school, program, platforms, creative_type,
      sizes, icps, tones, hooks,
      posts_per_day, dates, extra_context,
    } = body;

    const totalPosts = posts_per_day * dates.length;

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const dateList = dates.join(", ");
    const userMessage = `Generate a content calendar of exactly ${totalPosts} posts for these specific dates: ${dateList}

Create exactly ${posts_per_day} post(s) per day for each date listed above.

Distribute posts across these platforms: ${platforms.join(", ")}
Use these sizes: ${sizes.join(", ")}
Target these ICPs: ${icps.join(", ")}
Use these tones: ${tones.join(", ")}
Use these hook archetypes: ${hooks.join(", ")}

Vary the combinations — don't repeat the same ICP + tone + hook combo. Mix platforms and sizes naturally.
Each date must have exactly ${posts_per_day} post(s). Use the exact dates provided — do not add or skip any dates.

${extra_context ? `Additional context from the user:\n${extra_context}` : ""}

Return exactly ${totalPosts} post objects in a JSON array.`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: buildSystemPrompt({ school, program, creative_type }),
      messages: [{ role: "user", content: userMessage }],
    });

    const text = response.content[0].text;
    let posts;
    try {
      posts = JSON.parse(text);
    } catch {
      // Try to extract JSON array from response
      const match = text.match(/\[[\s\S]*\]/);
      if (match) {
        posts = JSON.parse(match[0]);
      } else {
        throw new Error("Failed to parse calendar response");
      }
    }

    return Response.json({ posts });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
