import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = (formData.get("file") as File | null) || (formData.get("document") as File | null);
    const docType = (formData.get("type") as string) || "document"; // "photo" | "aadhaar" | "id_proof" | "participant_photo"

    if (!file) {
      return NextResponse.json(
        { error: "No document file was uploaded. Please select a file." },
        { status: 400 }
      );
    }

    const fileType = file.type?.toLowerCase() || "";
    const fileName = file.name?.toLowerCase() || "";
    const isVideo = fileType.startsWith("video/") || docType.toLowerCase().includes("video");
    const isPhoto = docType.includes("photo") && !isVideo;
    const isAadhaar = (docType.includes("aadhaar") || docType.includes("id_proof")) && !isVideo;

    // File size validation
    const maxPhotoSize = 5 * 1024 * 1024; // 5 MB
    const maxAadhaarSize = 10 * 1024 * 1024; // 10 MB
    const maxVideoSize = 50 * 1024 * 1024; // 50 MB
    const maxSize = isVideo ? maxVideoSize : isPhoto ? maxPhotoSize : maxAadhaarSize;

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size exceeds the maximum limit of ${isVideo ? "50 MB" : isPhoto ? "5 MB" : "10 MB"}.` },
        { status: 400 }
      );
    }

    if (isPhoto) {
      const allowedPhotoTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
      const allowedExts = [".jpg", ".jpeg", ".png", ".webp"];
      const hasValidExt = allowedExts.some((ext) => fileName.endsWith(ext));
      if (!allowedPhotoTypes.includes(fileType) && !hasValidExt) {
        return NextResponse.json(
          { error: "Invalid image file. Please upload a Passport-size Photo in JPG, JPEG, PNG, or WEBP format." },
          { status: 400 }
        );
      }
    } else if (isAadhaar) {
      const allowedDocTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg", "image/webp"];
      const allowedExts = [".pdf", ".jpg", ".jpeg", ".png", ".webp"];
      const hasValidExt = allowedExts.some((ext) => fileName.endsWith(ext));
      if (!allowedDocTypes.includes(fileType) && !hasValidExt) {
        return NextResponse.json(
          { error: "Invalid document file. Please upload Aadhaar Card in PDF, JPG, JPEG, or PNG format." },
          { status: 400 }
        );
      }
    }

    const supabase = getSupabaseAdmin();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Try Supabase Storage upload first
    let bucketName = isVideo ? "dance-videos" : isPhoto ? "participant-photos" : "participant-documents";
    const timeStamp = Date.now();
    const uniqueId = Math.random().toString(36).substring(2, 9);
    const sanitizedOriginalName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = isVideo
      ? `videos/${timeStamp}_${uniqueId}_${sanitizedOriginalName}`
      : `${isPhoto ? "photos" : "docs"}/${timeStamp}_${uniqueId}_${sanitizedOriginalName}`;

    if (supabase) {
      // Attempt upload to primary bucket
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from(bucketName)
        .upload(filePath, buffer, {
          contentType: file.type || (isPhoto ? "image/jpeg" : "application/pdf"),
          upsert: true,
        });

      if (!uploadErr && uploadData) {
        const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(uploadData.path);
        const publicUrl = publicUrlData?.publicUrl || uploadData.path;

        return NextResponse.json({
          success: true,
          bucket: bucketName,
          path: uploadData.path,
          url: publicUrl,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        });
      }

      // Fallback: try "dance-videos" bucket if separate bucket not set up
      const fallbackBucket = "dance-videos";
      const { data: fbData, error: fbErr } = await supabase.storage
        .from(fallbackBucket)
        .upload(filePath, buffer, {
          contentType: file.type || (isPhoto ? "image/jpeg" : "application/pdf"),
          upsert: true,
        });

      if (!fbErr && fbData) {
        const { data: publicUrlData } = supabase.storage.from(fallbackBucket).getPublicUrl(fbData.path);
        const publicUrl = publicUrlData?.publicUrl || fbData.path;

        return NextResponse.json({
          success: true,
          bucket: fallbackBucket,
          path: fbData.path,
          url: publicUrl,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        });
      }
    }

    // Local Data URL fallback if storage is offline or unavailable
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type || "application/octet-stream"};base64,${base64}`;

    return NextResponse.json({
      success: true,
      bucket: "local",
      path: filePath,
      url: dataUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    });
  } catch (err: any) {
    console.error("Document upload route error:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred during document upload." },
      { status: 500 }
    );
  }
}
