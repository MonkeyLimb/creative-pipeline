import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 300;

const DEGREE_SCHOOLS = ["UMA", "SNHU", "AIU", "CTU", "FSU"];

function buildSystemPrompt(programContext) {
  const school = programContext?.school || "";
  const program = programContext?.program || "";
  const isDegree = DEGREE_SCHOOLS.includes(school);

  const complianceBlock = school
    ? `
COMPLIANCE RULES:
- School: ${school} | Program: ${program}
- Dreambound is the ONLY public brand. Never mention school names in copy.
- No employment guarantees, outcome promises, or job placement language.
- No "guarantee", "free", "dream career", "Fast Track".
${isDegree ? `- Degree program: use "study" and "education" only. Never "train"/"training". "Career" must pair with "path" or "journey".` : `- Certificate program: "training" is acceptable.${school === "CCI" ? " Urgency language is OK." : ""}`}
${school === "FSU" ? '- Financial aid line: "Financial Aid is available for those who qualify."' : ""}
${school !== "FSU" && school ? '- Financial aid line: "Financial aid may be available for those who qualify."' : ""}
${school === "AIU" || school === "CTU" ? '- No urgency language. Always include: "Completion times vary according to the individual student."' : ""}`
    : "";

  return `You are an expert social media copywriter and content calendar strategist for Dreambound, an education marketing brand.
You operate under the "Selling to Feeling" framework. Your job is to generate a full organic content calendar with copy already written for each post.

═══════════════════════════════════════════
THE "SELLING TO FEELING" FRAMEWORK
═══════════════════════════════════════════

ABSOLUTE RULE: One anchor per creative, one bucket per post. Despair and Hope must NEVER be mixed in the same post.

TRACK A: Program-Specific (Conversion)
Variables: [Program Context] + [Bucket Directive]
- Anchor 1: DESPAIR
  • Bucket A — Internal Conflict: Posts that surface the inner war between wanting more and feeling stuck. Self-doubt, imposter syndrome, fear of change.
  • Bucket B — Effort-Reality Gap: Posts about working hard but getting nowhere. Grinding at a job that doesn't value you. The gap between effort put in and results received.
- Anchor 2: HOPE
  • Bucket C — Emotional Validation: Posts that make the reader feel seen and understood. Affirming their desire for change is valid and normal.
  • Bucket D — Motivational Reframing: Posts that reframe their situation as a launchpad, not a dead end. Shifting perspective from stuck to starting.
- Anchor 3: BRIDGE
  • Bucket E — Private Desire: Posts that speak to the quiet ambitions people don't say out loud. The life they imagine when no one is watching.
  • Bucket F — Possible Paths Exist: Posts that gently introduce the idea that paths forward exist without hard-selling. Planting seeds of possibility.

TRACK B: Non-Programmatic (Community/Shareability)
Variable: Ignore programs entirely. These are community-building posts.
- Bucket G — Relatable Vent: Humor and agitation about universal work struggles, graveyard shifts, toxic bosses, alarm clocks, Monday dread.
- Bucket H — Unpopular Opinion: Debatable hot takes on workplace culture, hustle culture, career pivots, education norms.
- Bucket I — Hype-Up: Quotable inspiration about refusing to settle, betting on yourself, not accepting less than you deserve.

═══════════════════════════════════════════
${complianceBlock}

OUTPUT FORMAT:
You MUST return a valid JSON array. Each element is an object with EXACTLY these keys:
{
  "post_date": "YYYY-MM-DD",
  "platform": "Instagram" | "Facebook" | "TikTok",
  "content_format": "Image (4:5)" | "Image (1:1)" | "Video (9:16)" | "Video (4:5)" | "Carousel (4:5)" | "Carousel (1:1)" | etc.,
  "content_track": "Program-Specific (Conversion)" or "Community (Shareability)",
  "bucket": "<letter> — <full name>" (e.g. "H — Unpopular Opinion", "C — Emotional Validation"),
  "post_brief": "1-sentence concept summary of the post's narrative angle",
  "visual_hook": "DETAILED description of what the viewer SEES that stops the scroll (see rules below)",
  "caption": "The full social media caption: hook line + short body + CTA combined (see rules below)",
  "notes": "Optional production notes for the creative team (leave empty string if none)"
}

BUCKET FULL NAMES (use these exact labels in the "bucket" field):
- A — Internal Conflict
- B — Effort-Reality Gap
- C — Emotional Validation
- D — Motivational Reframing
- E — Private Desire
- F — Possible Paths Exist
- G — Relatable Vent
- H — Unpopular Opinion
- I — Hype-Up

RULES:
- Each post uses ONE anchor and ONE bucket only.
- Despair buckets (A, B) and Hope buckets (C, D) must NEVER be mixed in the same post.
- Bridge buckets (E, F) are transitional — lean hopeful but not overtly promotional.
- Track B posts (G, H, I) must never mention any school, program, or educational offering.

VISUAL HOOK (most important field — the visual IS the hook in social media):
- We do NOT shoot talking-head or selfie-cam videos. Our creative style is TEXT ON B-ROLL.
- All videos use thematic B-roll footage (stock, cinematic, trending) with bold text overlays. Think: mood-driven visuals with punchy on-screen text that stops the scroll.
- Be EXTREMELY specific and detailed. Describe exactly what the viewer sees in the first frame.
- For video: describe the B-roll scene (setting, movement, mood, color grade, lighting), the exact text overlay (wording, font style, placement, animation), and how they work together to stop the scroll in the first 1-3 seconds.
- For images: describe the exact composition, focal point, text placement, font style, and visual contrast that demands attention.
- Specify the B-roll theme (e.g. "slow-motion coffee pour in golden morning light", "aerial city timelapse at dusk", "close-up hands typing on laptop with warm bokeh", "woman walking through campus in cinematic slow-mo").
- Specify the text overlay (e.g. "bold white all-caps centered: 'THIS IS YOUR SIGN'", "handwritten-style text fading in word by word", "split-screen with text on left, B-roll on right").
- Think like a creative director briefing a designer — give them enough detail to execute without guessing.
- NEVER suggest talking-head, direct-to-camera, or selfie-style content.

CAPTION (keep it SHORT — social media users don't read essays):
- Combine hook + body + CTA into one concise caption.
- Hook line: punchy, scroll-stopping, under 15 words.
- Body: 1-2 SHORT sentences max. Get to the point.
- CTA: one clear line.
- Total caption should feel like a text from a friend, not a blog post.

- Distribute posts evenly across the provided dates and platforms.
- Respond ONLY with the JSON array. No markdown, no preamble, no explanation.`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      trackMode, programContext, buckets, brief,
      images, dates, dateMode, dateRange, platforms,
      formatMix,
    } = body;

    const totalPosts = Object.values(buckets).reduce((sum, n) => sum + n, 0);

    if (totalPosts === 0) {
      return Response.json({ error: "Please specify at least one post to generate." }, { status: 400 });
    }
    if (totalPosts > 50) {
      return Response.json({ error: "Maximum 50 posts per batch." }, { status: 400 });
    }

    // Build bucket breakdown
    const bucketBreakdown = Object.entries(buckets)
      .filter(([, count]) => count > 0)
      .map(([letter, count]) => `- Bucket ${letter}: ${count} post(s)`)
      .join("\n");

    // Build date instruction
    let dateInstruction = "";
    if (dateMode === "dates" && dates?.length) {
      dateInstruction = `Distribute posts across these exact dates: ${dates.join(", ")}`;
    } else if (dateMode === "range" && dateRange?.start && dateRange?.end) {
      dateInstruction = `Distribute posts evenly from ${dateRange.start} to ${dateRange.end}`;
    }

    // Build format instruction
    let formatInstruction = "";
    if (formatMix && Object.values(formatMix).some((v) => v > 0)) {
      const parts = Object.entries(formatMix)
        .filter(([, count]) => count > 0)
        .map(([fmt, count]) => `${count} ${fmt}`)
        .join(", ");
      formatInstruction = `Content format distribution: ${parts}. Assign formats to posts accordingly.`;
    } else {
      formatInstruction = `Assign content formats to each post. Default to "Image (4:5)" for image posts and "Video (9:16)" for video posts. Mix both image and video formats for variety.`;
    }

    // Build program context line
    const programLine =
      trackMode !== "B" && programContext?.school && programContext?.program
        ? `Program Context: ${programContext.school} — ${programContext.program}\nWeave the program/field into Track A copy naturally without naming the school directly.`
        : "";

    // Build brief line
    const briefLine = brief ? `Creative Brief / Direction:\n${brief}` : "";

    const userMessage = `Generate exactly ${totalPosts} organic social media posts for a content calendar.

BUCKET DISTRIBUTION (follow exactly):
${bucketBreakdown}

${dateInstruction}
Platforms to use: ${platforms.join(", ")}
${formatInstruction}
${programLine}
${briefLine}

Each post must strictly follow its assigned bucket's emotional directive. Vary hooks, angles, visual suggestions, and formats across posts for maximum content diversity.

Return a JSON array of exactly ${totalPosts} objects.`;

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    // Build messages — multimodal if images provided
    const content = [];
    if (images && images.length > 0) {
      for (const img of images) {
        content.push({
          type: "image",
          source: { type: "base64", media_type: img.mediaType || "image/jpeg", data: img.data },
        });
      }
      content.push({
        type: "text",
        text: `Use these inspiration images to inform the visual direction and mood of the posts.\n\n${userMessage}`,
      });
    } else {
      content.push({ type: "text", text: userMessage });
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: buildSystemPrompt(trackMode !== "B" ? programContext : null),
      messages: [{ role: "user", content }],
    });

    let rawText = response.content[0].text.trim();
    // Strip markdown code fences if present
    rawText = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
    let posts;
    try {
      posts = JSON.parse(rawText);
    } catch {
      const match = rawText.match(/\[[\s\S]*\]/);
      if (match) {
        posts = JSON.parse(match[0]);
      } else {
        throw new Error("Failed to parse AI response as JSON");
      }
    }

    // Validate and clean structure
    const requiredKeys = ["post_date", "platform", "content_format", "content_track", "bucket", "post_brief", "visual_hook", "caption", "notes"];
    posts = posts.map((post) => {
      const cleaned = {};
      for (const key of requiredKeys) {
        cleaned[key] = post[key] || "";
      }
      return cleaned;
    });

    return Response.json({ posts });
  } catch (error) {
    console.error("Content engine error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
