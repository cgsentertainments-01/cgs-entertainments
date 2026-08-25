export interface ParsedDocuments {
  passportPhoto: string | null;
  idProof: string | null;
  danceVideo: string | null;
  otherPhotos: string[];
  otherDocuments: Array<{ name: string; url: string }>;
}

/**
 * Extracts and maps document URLs from various legacy and current Supabase JSON formats.
 */
export function parseParticipantDocuments(
  docUrls?: Record<string, any> | null,
  details?: Record<string, any> | null,
  participantData?: Record<string, any> | null
): ParsedDocuments {
  const docs: ParsedDocuments = {
    passportPhoto: null,
    idProof: null,
    danceVideo: null,
    otherPhotos: [],
    otherDocuments: [],
  };

  const sources = [
    docUrls || {},
    details?.docUrls || details?.document_urls || details?.documents || {},
    details || {},
    participantData || {},
  ];

  for (const src of sources) {
    if (!src || typeof src !== "object") continue;

    // 1. Passport Photo / Profile Photo
    if (!docs.passportPhoto) {
      docs.passportPhoto =
        src.passportPhoto ||
        src.passport_photo ||
        src.photo ||
        src.profile_photo ||
        src.profilePhoto ||
        src.avatar ||
        src.participant_photo ||
        null;
    }

    // 2. Aadhaar / ID Proof
    if (!docs.idProof) {
      docs.idProof =
        src.idProof ||
        src.id_proof ||
        src.idProofUrl ||
        src.id_proof_url ||
        src.aadhaar ||
        src.aadhaar_card ||
        src.aadhaar_proof ||
        src.govt_id ||
        null;
    }

    // 3. Dance Video
    if (!docs.danceVideo) {
      docs.danceVideo =
        src.danceVideo ||
        src.dance_video ||
        src.video_url ||
        src.video_signed_url ||
        src.video_path ||
        src.video ||
        src.performance_video ||
        src.audition_video ||
        null;
    }

    // 4. Other Photos
    if (src.other_photos && Array.isArray(src.other_photos)) {
      src.other_photos.forEach((p: string) => {
        if (p && typeof p === "string" && !docs.otherPhotos.includes(p)) {
          docs.otherPhotos.push(p);
        }
      });
    }
    if (src.otherPhotos && Array.isArray(src.otherPhotos)) {
      src.otherPhotos.forEach((p: string) => {
        if (p && typeof p === "string" && !docs.otherPhotos.includes(p)) {
          docs.otherPhotos.push(p);
        }
      });
    }

    // 5. Other Documents
    if (src.other_documents && Array.isArray(src.other_documents)) {
      src.other_documents.forEach((d: any) => {
        if (typeof d === "string" && !docs.otherDocuments.some((x) => x.url === d)) {
          docs.otherDocuments.push({ name: "Document", url: d });
        } else if (d && typeof d === "object" && d.url) {
          if (!docs.otherDocuments.some((x) => x.url === d.url)) {
            docs.otherDocuments.push({ name: d.name || "Document", url: d.url });
          }
        }
      });
    }
  }

  return docs;
}
