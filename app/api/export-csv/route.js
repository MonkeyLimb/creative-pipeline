function escapeCSV(val) {
  if (!val) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function POST(request) {
  try {
    const { posts, school, program } = await request.json();

    // Build CSV in the user's preferred format: each post is a section with key-value rows
    const lines = [];

    // Header row
    lines.push(",,,,Links to final output");

    for (let i = 0; i < posts.length; i++) {
      const p = posts[i];

      if (i > 0) {
        // Blank separator rows
        lines.push(",,,,");
        lines.push(",,,,");
      }

      lines.push(`Post ${i + 1},,,,`);
      lines.push(`,Post Brief (Description),${escapeCSV(p.brief)},,`);
      lines.push(`,Required to be in the Post,${escapeCSV(p.required_elements)},,`);
      lines.push(`,Size,${escapeCSV(p.size)},,`);
      lines.push(`,Platform,${escapeCSV(p.platform)},,`);
      lines.push(`,Hook Archetype,${escapeCSV(p.hook_archetype)},,`);
      lines.push(`,ICP Target,${escapeCSV(p.icp)},,`);
      lines.push(`,Tone,${escapeCSV(p.tone)},,`);
      lines.push(`,Notes,${escapeCSV(p.notes)},,`);
      lines.push(`,Post Date,${escapeCSV(p.post_date)},,`);
      lines.push(`,Inspiration,,,`);
      lines.push(`,Versions,,,`);
      lines.push(`,Caption,${escapeCSV(p.caption)},,`);
      lines.push(`,AI Visual Prompt,${escapeCSV(p.ai_visual_prompt)},,`);
      lines.push(`,Extra Notes,${escapeCSV(p.extra_notes)},,`);
    }

    // Also add a flat table version as a second section for easy filtering
    lines.push("");
    lines.push("");
    lines.push("--- FLAT TABLE (for filtering/sorting) ---,,,,");
    lines.push("Post #,Date,Platform,Size,Creative Type,Hook Archetype,ICP,Tone,Brief,Required Elements,Notes,Caption,AI Visual Prompt,Extra Notes");

    for (let i = 0; i < posts.length; i++) {
      const p = posts[i];
      lines.push([
        i + 1,
        escapeCSV(p.post_date),
        escapeCSV(p.platform),
        escapeCSV(p.size),
        escapeCSV(p.creative_type),
        escapeCSV(p.hook_archetype),
        escapeCSV(p.icp),
        escapeCSV(p.tone),
        escapeCSV(p.brief),
        escapeCSV(p.required_elements),
        escapeCSV(p.notes),
        escapeCSV(p.caption),
        escapeCSV(p.ai_visual_prompt),
        escapeCSV(p.extra_notes),
      ].join(","));
    }

    const csv = lines.join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${program.replace(/\s+/g, "_")}_content_calendar.csv"`,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
