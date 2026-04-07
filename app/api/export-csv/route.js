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
      lines.push(`,Post Date,${escapeCSV(p.post_date)},,`);
      lines.push(`,Platform,${escapeCSV(p.platform)},,`);
      lines.push(`,Content Track,${escapeCSV(p.content_track)},,`);
      lines.push(`,Bucket,${escapeCSV(p.bucket)},,`);
      lines.push(`,Content Format,${escapeCSV(p.content_format || p.size)},,`);
      lines.push(`,Post Brief (Description),${escapeCSV(p.post_brief || p.brief)},,`);
      lines.push(`,Visual Hook (Required in Post),${escapeCSV(p.visual_hook || p.required_elements)},,`);
      lines.push(`,Notes,${escapeCSV(p.notes)},,`);
      lines.push(`,Inspiration,,,`);
      lines.push(`,Versions,,,`);
      lines.push(`,Caption,${escapeCSV(p.caption)},,`);
      lines.push(`,Extra Notes,${escapeCSV(p.extra_notes)},,`);
    }

    // Also add a flat table version as a second section for easy filtering
    lines.push("");
    lines.push("");
    lines.push("--- FLAT TABLE (for filtering/sorting) ---,,,,");
    lines.push("Post #,Date,Platform,Content Track,Bucket,Content Format,Post Brief,Visual Hook,Notes,Caption,Extra Notes");

    for (let i = 0; i < posts.length; i++) {
      const p = posts[i];
      lines.push([
        i + 1,
        escapeCSV(p.post_date),
        escapeCSV(p.platform),
        escapeCSV(p.content_track),
        escapeCSV(p.bucket),
        escapeCSV(p.content_format || p.size),
        escapeCSV(p.post_brief || p.brief),
        escapeCSV(p.visual_hook || p.required_elements),
        escapeCSV(p.notes),
        escapeCSV(p.caption),
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
