import {
  uploadAssetFromUrl,
  generateDesign,
  createDesignFromCandidate,
  startEditingTransaction,
  getDesignPages,
  performEditingOperations,
  commitEditingTransaction,
  searchFolders,
  createFolder,
  moveItemToFolder,
  getDesign,
} from "../../lib/canva-client.js";

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
    const { school, program, platform, creative_type, hook, subtext, cta, canva_prompt, cloudinary_url } = body;

    const disclaimer = computeDisclaimer(school, creative_type);

    // Step 1: Upload asset if needed
    let assetIds = [];
    if (cloudinary_url && cloudinary_url.trim()) {
      try {
        const assetId = await uploadAssetFromUrl(cloudinary_url);
        if (assetId) assetIds.push(assetId);
      } catch (err) {
        console.error("Asset upload failed:", err.message);
      }
    }

    // Step 2: Generate design
    const { job_id, candidates } = await generateDesign({
      designType: "instagram_post",
      query: canva_prompt || "Instagram ad with bold text",
      assetIds: assetIds.length > 0 ? assetIds : undefined,
    });

    if (!candidates.length) throw new Error("No candidates returned from generate-design");

    // Step 3: Create design from first candidate
    const candidateId = candidates[0].id || candidates[0].candidate_id;
    const design = await createDesignFromCandidate(job_id, candidateId);
    const designId = design?.id;
    if (!designId) throw new Error("No design_id returned");

    // Step 4: Edit text
    const transactionId = await startEditingTransaction(designId);
    const pages = await getDesignPages(designId);

    const operations = [];
    if (pages[0]?.elements) {
      const textElements = pages[0].elements.filter((e) => e.type === "text");
      textElements.sort((a, b) => (b.width || 0) * (b.height || 0) - (a.width || 0) * (a.height || 0));

      const texts = [hook, subtext, cta, disclaimer].filter(Boolean);
      for (let i = 0; i < Math.min(textElements.length, texts.length); i++) {
        operations.push({
          type: "update_element",
          element_id: textElements[i].id,
          properties: { text: texts[i] },
        });
      }
    }

    if (operations.length > 0) {
      await performEditingOperations(designId, transactionId, operations);
    }
    await commitEditingTransaction(designId, transactionId);

    // Step 5: Folder
    let folderId = null;
    let folderName = `${program} — ${creative_type} — ${platform}`;
    let folderUrl = null;

    try {
      const folders = await searchFolders(program);
      if (folders.length > 0) {
        folderId = folders[0].id;
        folderName = folders[0].name;
        folderUrl = folders[0].url || null;
      } else {
        const newFolder = await createFolder(folderName);
        folderId = newFolder?.id;
        folderUrl = newFolder?.url || null;
      }
    } catch (err) {
      console.error("Folder error:", err.message);
    }

    if (folderId) {
      try {
        await moveItemToFolder(designId, folderId);
      } catch (err) {
        console.error("Move error:", err.message);
      }
    }

    let designUrl = `https://www.canva.com/design/${designId}`;
    try {
      const d = await getDesign(designId);
      designUrl = d?.design?.url || d?.url || designUrl;
    } catch {}

    return Response.json({
      design_id: designId,
      design_url: designUrl,
      folder_url: folderUrl,
      folder_name: folderName,
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
        status: "error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
