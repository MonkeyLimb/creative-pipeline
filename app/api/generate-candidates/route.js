import { uploadAssetFromUrl, generateDesign, getDesignThumbnail, createDesignFromCandidate } from "../../lib/canva-client.js";

export async function POST(request) {
  try {
    const body = await request.json();
    const { canva_prompt, cloudinary_url } = body;

    // Step 1: Upload asset if Cloudinary URL provided
    let assetIds = [];
    if (cloudinary_url && cloudinary_url !== "none" && cloudinary_url.trim()) {
      try {
        const assetId = await uploadAssetFromUrl(cloudinary_url);
        if (assetId) assetIds.push(assetId);
      } catch (err) {
        // Continue without asset — don't block the whole flow
        console.error("Asset upload failed:", err.message);
      }
    }

    // Step 2: Generate design candidates
    const designType = "instagram_post";
    const query = canva_prompt || "Instagram ad with bold text and full bleed background";

    const { job_id, candidates: rawCandidates } = await generateDesign({
      designType,
      query,
      assetIds: assetIds.length > 0 ? assetIds : undefined,
    });

    // Step 3: Get thumbnails for each candidate
    const candidates = [];
    for (let i = 0; i < rawCandidates.length; i++) {
      const c = rawCandidates[i];
      let thumbnailUrl = c.thumbnail?.url || null;

      // If candidate has a design_id, try to get a thumbnail
      if (!thumbnailUrl && c.id) {
        try {
          thumbnailUrl = await getDesignThumbnail(c.id);
        } catch {
          // No thumbnail available
        }
      }

      candidates.push({
        index: i,
        candidate_id: c.id || c.candidate_id || `${i}`,
        thumbnail_url: thumbnailUrl,
      });
    }

    return Response.json({
      job_id,
      candidates,
      asset_id: assetIds[0] || null,
      error: null,
    });
  } catch (error) {
    return Response.json(
      { job_id: null, candidates: [], asset_id: null, error: error.message },
      { status: 500 }
    );
  }
}
