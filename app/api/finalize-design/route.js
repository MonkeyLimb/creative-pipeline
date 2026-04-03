import {
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
    const {
      school, program, platform, creative_type,
      hook, subtext, cta,
      job_id, candidate_id,
    } = body;

    const disclaimer = computeDisclaimer(school, creative_type);

    // Step 1: Create design from chosen candidate
    const design = await createDesignFromCandidate(job_id, candidate_id);
    const designId = design?.id;
    if (!designId) throw new Error("No design_id returned from create-design-from-candidate");

    // Step 2: Start editing transaction
    const transactionId = await startEditingTransaction(designId);

    // Step 3: Get pages
    const pages = await getDesignPages(designId);
    const pageId = pages[0]?.id;

    // Step 4: Build editing operations — set text elements
    const operations = [];

    // Find and update text elements, or add new ones
    if (pages[0]?.elements) {
      const textElements = pages[0].elements.filter((e) => e.type === "text");
      // Sort by size (largest first) to match hook → subtext → cta → disclaimer
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

    // Step 5: Commit editing
    await commitEditingTransaction(designId, transactionId);

    // Step 6: Search/create folder
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
      console.error("Folder operation failed:", err.message);
    }

    // Step 7: Move design to folder
    if (folderId) {
      try {
        await moveItemToFolder(designId, folderId);
      } catch (err) {
        console.error("Move to folder failed:", err.message);
      }
    }

    // Get design URL
    let designUrl = null;
    try {
      const designData = await getDesign(designId);
      designUrl = designData?.design?.url || designData?.url || `https://www.canva.com/design/${designId}`;
    } catch {
      designUrl = `https://www.canva.com/design/${designId}`;
    }

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
