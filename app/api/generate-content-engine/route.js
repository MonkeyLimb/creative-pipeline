import Anthropic from "@anthropic-ai/sdk";

const DEGREE_SCHOOLS = ["UMA", "SNHU", "AIU", "CTU", "FSU"];

function buildSystemPrompt(programContext) {
  const school = programContext?.school || "";
  const program = programContext?.program || "";
  const isDegree = DEGREE_SCHOOLS.includes(school);

  const complianceBlock = school
    ? `
COMPLIANCE RULES FOR PROGRAM-SPECIFIC CONTENT:
- School: ${school} | Program: ${program}
- Dreambound is the ONLY public brand. Never mention school names in copy.
- No employment guarantees, outcome promises, or job placement language.
- No "guarantee", "free", "dream career", "Fast Track".
${isDegree ? `- Degree program: use "study" and "education" only. Never "train"/"training". "Career" must pair with "path" or "journey".` : `- Certificate program: "training" is acceptable.${school === "CCI" ? " Urgency language is OK." : ""}`}
${school === "FSU" ? '- Financial aid line: "Financial Aid is available for those who qualify."' : ""}
${school !== "FSU" && school ? '- Financial aid line: "Financial aid may be available for those who qualify."' : ""}
${school === "AIU" || school === "CTU" ? '- No urgency language. Always include: "Completion times vary according to the individual student."' : ""}`
    : "";

  return `You are an expert social media copywriter for Dreambound, an education marketing brand.
You operate under the "Selling to Feeling" framework. Your job is to generate social media posts that follow strict structural rules.

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
  "Content_Track": "A" or "B",
  "Bucket_Letter": "A", "B", "C", "D", "E", "F", "G", "H", or "I",
  "Hook": "The opening hook line that stops the scroll",
  "Body_Text": "The main body copy of the post",
  "Call_To_Action": "The CTA line",
  "Suggested_Canva_Visual_Type": "A brief description of the visual style/type for Canva (e.g., 'Dark gradient with bold white text overlay', 'Split-screen before/after lifestyle photo')"
}

RULES:
- Each post uses ONE anchor and ONE bucket only.
- Despair buckets (A, B) and Hope buckets (C, D) must NEVER be mixed in the same post.
- Bridge buckets (E, F) are transitional — they lean hopeful but must not be overtly promotional.
- Track B posts (G, H, I) must never mention any school, program, or educational offering.
- Hook must be punchy, scroll-stopping, and under 15 words.
- Body_Text should be 2-4 sentences of compelling social media copy.
- Call_To_Action should be clear, concise, and match the bucket's emotional tone.
- Respond ONLY with the JSON array. No markdown, no preamble, no explanation.`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { trackMode, programContext, buckets } = body;

    // buckets is an object like { A: 2, B: 3, G: 5 } — quantity per bucket letter
    const totalPosts = Object.values(buckets).reduce((sum, n) => sum + n, 0);

    if (totalPosts === 0) {
      return Response.json({ error: "Please specify at least one post to generate." }, { status: 400 });
    }

    if (totalPosts > 50) {
      return Response.json({ error: "Maximum 50 posts per batch." }, { status: 400 });
    }

    const bucketBreakdown = Object.entries(buckets)
      .filter(([, count]) => count > 0)
      .map(([letter, count]) => `- Bucket ${letter}: ${count} post(s)`)
      .join("\n");

    const programLine =
      trackMode !== "B" && programContext?.school && programContext?.program
        ? `\nProgram Context: ${programContext.school} — ${programContext.program}\nUse this context to inform Track A posts. Weave the program/field into the copy naturally without naming the school directly.`
        : "";

    const userMessage = `Generate exactly ${totalPosts} social media posts with this exact distribution:

${bucketBreakdown}
${programLine}

Each post must strictly follow its assigned bucket's emotional directive from the framework. Vary the hooks, angles, and visual suggestions across posts. Return a JSON array of exactly ${totalPosts} objects.`;

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: buildSystemPrompt(trackMode !== "B" ? programContext : null),
      messages: [{ role: "user", content: userMessage }],
    });

    const text = response.content[0].text;
    let posts;
    try {
      posts = JSON.parse(text);
    } catch {
      const match = text.match(/\[[\s\S]*\]/);
      if (match) {
        posts = JSON.parse(match[0]);
      } else {
        throw new Error("Failed to parse AI response as JSON");
      }
    }

    // Validate structure
    const requiredKeys = ["Content_Track", "Bucket_Letter", "Hook", "Body_Text", "Call_To_Action", "Suggested_Canva_Visual_Type"];
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
