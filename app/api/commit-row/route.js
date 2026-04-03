import Anthropic from "@anthropic-ai/sdk";
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

const PLATFORM_DIMS = {
  instagram: { w: 1080, h: 1080 },
  facebook: { w: 940, h: 788 },
  tiktok: { w: 1080, h: 1920 },
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { school, program, platform, creative_type, hook, subtext, cta, canva_prompt, cloudinary_url } = body;

    const disclaimer = computeDisclaimer(school, creative_type);
    const dims = PLATFORM_DIMS[platform?.toLowerCase()] || PLATFORM_DIMS.instagram;

    // Step 1: Generate ad image with Claude
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const imagePrompt = `Create a ${platform} ${creative_type} ad creative for Dreambound education platform.

Design specs:
- Dimensions: ${dims.w}x${dims.h}px
- Style: ${canva_prompt || "Bold, modern ad with full bleed background"}
- Program: ${program}

Text to include on the design:
- HOOK (large, dominant, top): "${hook}"
- SUBTEXT (medium, below hook): "${subtext}"
- CTA (button or bold, bottom): "${cta}"
${disclaimer ? `- DISCLAIMER (small footer): "${disclaimer}"` : ""}

Brand rules:
- Brand name: Dreambound (only brand shown)
- No school names visible
- Bold white or light text on dark/vibrant background
- Professional, clean, educational feel
- No stock photo people faces
${cloudinary_url ? `- Use this as background reference: ${cloudinary_url}` : ""}

Generate this as a complete, ready-to-use ad image.`;

    const imageResponse = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: imagePrompt,
        },
      ],
    });

    // Extract the image from the response
    let imageBase64 = null;
    let imageMediaType = null;
    for (const block of imageResponse.content) {
      if (block.type === "image") {
        imageBase64 = block.source.data;
        imageMediaType = block.source.media_type;
        break;
      }
    }

    // Step 2: Create design in Canva
    const title = `${program} — ${hook?.slice(0, 30) || "Creative"}`;
    const design = await createDesign(title, platform);
    const designId = design?.id;
    if (!designId) throw new Error("Failed to create Canva design");

    // Get design URL
    let designUrl = design?.url || design?.edit_url;
    if (!designUrl) {
      try {
        const details = await getDesign(designId);
        designUrl = details?.url || details?.edit_url || `https://www.canva.com/design/${designId}/edit`;
      } catch {
        designUrl = `https://www.canva.com/design/${designId}/edit`;
      }
    }

    // Step 3: Find or create folder
    let folderId = null;
    let folderName = `${program} — ${creative_type} — ${platform}`;
    let folderUrl = null;

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
    if (folderId && designId) {
      try {
        await moveItemToFolder(designId, folderId);
      } catch (err) {
        console.error("Move failed:", err.message);
      }
    }

    // Build copy text and image preview
    const copyText = [hook, subtext, cta, disclaimer].filter(Boolean);

    return Response.json({
      design_id: designId,
      design_url: designUrl,
      folder_url: folderUrl,
      folder_name: folderName,
      copy_text: copyText,
      image_preview: imageBase64 ? `data:${imageMediaType || "image/png"};base64,${imageBase64}` : null,
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
