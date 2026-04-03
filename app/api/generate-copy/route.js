import Anthropic from "@anthropic-ai/sdk";

class Semaphore {
  constructor(max) {
    this.max = max;
    this.count = 0;
    this.queue = [];
  }
  async acquire() {
    if (this.count < this.max) {
      this.count++;
      return;
    }
    await new Promise((resolve) => this.queue.push(resolve));
  }
  release() {
    this.count--;
    if (this.queue.length > 0) {
      this.count++;
      this.queue.shift()();
    }
  }
}

const semaphore = new Semaphore(4);

function buildSystemPrompt({ school, program, platform, creative_type, icp, tone, archetype }) {
  return `You are a compliant ad copywriter for Dreambound.
School: ${school} | Program: ${program} | Platform: ${platform} | Creative type: ${creative_type}
ICP: ${icp} | Tone: ${tone} | Hook Archetype: ${archetype}

COMPLIANCE RULES:
- Dreambound is the ONLY public brand. No school names in copy ever.
- No employment guarantees, outcome promises, or job placement language.
- No "guarantee", "free", "dream career", "Fast Track".
- Degree programs (UMA, SNHU, AIU, CTU, FSU): "study" and "education" only. Never "train" or "training". "Career" must always pair with "path" or "journey".
- Certificate programs (CCI, Herzing, MedCerts): "training" is acceptable. CCI: urgency language is OK.
- FSU: financial aid line must read exactly "Financial Aid is available for those who qualify."
- All other paid: "Financial aid may be available for those who qualify."
- AIU and CTU: no urgency language. Always append "Completion times vary according to the individual student."

Respond ONLY in valid JSON. No markdown, no preamble:
{
  "hook": "...",
  "subtext": "...",
  "cta": "...",
  "canva_prompt": "Instagram paid ad. Hook dominates. Full bleed background. Bold white text. Dreambound brand only. Visual context: [derive from program and tone].",
  "compliance_notes": ["..."]
}`;
}

async function generateOne(client, params, index) {
  await semaphore.acquire();
  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      system: buildSystemPrompt(params),
      messages: [
        {
          role: "user",
          content: `Generate creative #${index + 1} for a ${params.platform} ${params.creative_type} ad. Make it unique from other variations. Use the ${params.archetype} hook archetype. Target ICP: ${params.icp}. Tone: ${params.tone}.`,
        },
      ],
    });

    const text = response.content[0].text;
    return JSON.parse(text);
  } finally {
    semaphore.release();
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      school,
      program,
      platform,
      creative_type,
      num_creatives,
      icp,
      tone,
      archetype,
      cloudinary_url,
    } = body;

    const count = Math.min(Number(num_creatives) || 5, 15);

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const params = { school, program, platform, creative_type, icp, tone, archetype };

    const promises = Array.from({ length: count }, (_, i) => generateOne(client, params, i));
    const results = await Promise.all(
      promises.map((p) => p.then((r) => ({ ok: true, data: r })).catch((e) => ({ ok: false, error: e.message })))
    );

    const creatives = results.map((r, i) => {
      if (r.ok) {
        return { id: i, ...r.data, cloudinary_url: cloudinary_url || "", status: "pending" };
      }
      return {
        id: i,
        hook: "",
        subtext: "",
        cta: "",
        canva_prompt: "",
        compliance_notes: [],
        cloudinary_url: cloudinary_url || "",
        status: "error",
        error: r.error,
      };
    });

    return Response.json({ creatives });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
