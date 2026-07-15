const BUCKET = "gallery-submissions";

export class GalleryRepository {
  constructor(client) {
    this.client = client;
    this.source = client?.configured ? "supabase" : "local";
  }

  async getApproved({ limit = 48 } = {}) {
    if (!this.client?.configured) return [];
    const params = new URLSearchParams({
      select: "id,client_submission_id,title,creator,image_path,mime_type,byte_size,width,height,atlas_entity_id,moderation_status,created_at",
      moderation_status: "eq.approved",
      order: "created_at.desc",
      limit: String(Math.min(80, Math.max(1, limit)))
    });
    const rows = await this.client.request(`/rest/v1/gallery_submissions?${params}`);
    return rows.map((row) => mapGallerySubmission(row, this.client));
  }

  async submit({ clientSubmissionId, title, creator, atlasEntityId, width, height, imageBlob }) {
    if (!this.client?.configured) throw new Error("Shared Gallery is offline.");
    if (!(imageBlob instanceof Blob) || !["image/png", "image/jpeg", "image/webp"].includes(imageBlob.type) || imageBlob.size > 3_145_728) throw new Error("Shared Gallery accepts PNG, JPEG, or WebP images up to 3 MB.");
    const id = validUuid(clientSubmissionId) ? clientSubmissionId : crypto.randomUUID();
    const extension = imageBlob.type === "image/jpeg" ? "jpg" : imageBlob.type.split("/")[1];
    const imagePath = `submissions/${id}.${extension}`;
    await this.client.upload(BUCKET, imagePath, imageBlob, { contentType: imageBlob.type });
    await this.client.request("/rest/v1/gallery_submissions", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: {
        client_submission_id: id,
        title: cleanText(title, 80) || "Untitled",
        creator: cleanText(creator, 80) || "anonymous",
        image_path: imagePath,
        mime_type: imageBlob.type,
        byte_size: imageBlob.size,
        width,
        height,
        atlas_entity_id: cleanText(atlasEntityId, 120) || null,
        moderation_status: "review",
        metadata: { source: "awaken-paint", projectStoredLocally: true }
      }
    });
    return {
      id,
      name: `${cleanText(title, 80) || "Untitled"}.png`,
      title: cleanText(title, 80) || "Untitled",
      creator: cleanText(creator, 80) || "anonymous",
      type: "Gallery Image",
      path: `A:\\Gallery\\${cleanText(title, 80) || "Untitled"}.png`,
      src: this.client.publicStorageUrl(BUCKET, imagePath),
      imagePath,
      size: imageBlob.size,
      width,
      height,
      moderationStatus: "review",
      localOnly: false
    };
  }

  subscribe(callback) {
    if (!this.client?.configured) return () => {};
    return this.client.subscribe({ table: "gallery_submissions", event: "*" }, callback);
  }
}

export function mapGallerySubmission(row, client) {
  return {
    id: row.client_submission_id || row.id,
    remoteId: row.id,
    name: `${row.title}.png`,
    title: row.title,
    creator: row.creator,
    type: "Gallery Image",
    path: `A:\\Gallery\\${row.title}.png`,
    src: client.publicStorageUrl(BUCKET, row.image_path),
    imagePath: row.image_path,
    size: row.byte_size,
    width: row.width,
    height: row.height,
    atlasEntityId: row.atlas_entity_id,
    moderationStatus: row.moderation_status,
    modified: row.created_at,
    localOnly: false
  };
}

function cleanText(value, maximum) { return typeof value === "string" ? value.trim().slice(0, maximum) : ""; }
function validUuid(value) { return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value || ""); }
