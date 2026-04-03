import { generateAdSVG } from "../../lib/svg-generator.js";
import { createDesign, getDesign, searchFolders, createFolder, moveItemToFolder } from "../../lib/canva-client.js";

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
    const { school, program, platform, creative_type, hook, subtext, cta, canva_prompt } = body;

    const disclaimer = computeDisclaimer(school, creative_type);

    // Step 1: Generate SVG ad creative
    const { svg } = generateAdSVG({ hook, subtext, cta, disclaimer, platform, program, creative_type });
    const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

    // Step 2: Create design in Canva
    const title = `${program} — ${(hook || "Creative").slice(0, 30)}`;
    let designId = null;
    let designUrl = null;

    try {
      const design = await createDesign(title, platform);
      designId = design?.id;

      designUrl = design?.url || design?.edit_url;
      if (!designUrl && designId) {
        try {
          const details = await getDesign(designId);
          designUrl = details?.url || details?.edit_url || `https://www.canva.com/design/${designId}/edit`;
        } catch {
          designUrl = `https://www.canva.com/design/${designId}/edit`;
        }
      }
    } catch (canvaErr) {
      // Canva design creation failed — still return the SVG preview
      console.error("Canva design creation failed:", canvaErr.message);
    }

    // Step 3: Find or create folder
    let folderId = null;
    let folderName = `${program} — ${creative_type} — ${platform}`;
    let folderUrl = null;

    if (designId) {
      try {
        const folders = await searchFolders(program);
        if (folders.length > 0) {
          folderId = folders[0].id;
          folderName = folders[0].name || folderName;
          folderUrl = folders[0].url || null;
        }
      } catch {}

      if (!folderId) {
        try {
          const f = await createFolder(folderName);
          folderId = f?.id;
          folderUrl = f?.url || null;
        } catch (err) {
          console.error("Folder creation failed:", err.message);
        }
      }

      // Step 4: Move design to folder
      if (folderId) {
        try {
          await moveItemToFolder(designId, folderId);
        } catch (err) {
          console.error("Move failed:", err.message);
        }
      }
    }

    const copyText = [hook, subtext, cta, disclaimer].filter(Boolean);

    return Response.json({
      design_id: designId,
      design_url: designUrl,
      folder_url: folderUrl,
      folder_name: folderName,
      copy_text: copyText,
      image_preview: svgDataUrl,
      status: "success",
      error: null,
    });
  } catch (error) {
    return Response.json(
      {
        design_id: null,
        design_url: null,
        folder_url: null,
        folder_name: null,
        copy_text: [],
        image_preview: null,
        status: "error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
