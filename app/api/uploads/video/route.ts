import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = (formData.get("file") as File | null) || (formData.get("video") as File | null);

    if (!file) {
      return NextResponse.json(
        { error: "No video file was uploaded. Please select a video file." },
        { status: 400 }
      );
    }

    // Check file size (50 MB limit as per Supabase bucket setting)
    const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File size exceeds the 50 MB maximum limit for dance-videos." },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo", "video/avi", "video/mpeg"];
    const fileType = file.type?.toLowerCase() || "";
    if (fileType && !allowedTypes.some((t) => fileType.includes(t.split("/")[1]))) {
      if (!fileType.startsWith("video/")) {
        return NextResponse.json(
          { error: "Invalid file type. Please upload a valid video file (MP4, MOV, WEBM, AVI)." },
          { status: 400 }
        );
      }
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase administrative client is not configured." },
        { status: 500 }
      );
    }

    // BUCKET NAME: dance-videos
    const BUCKET_NAME = "dance-videos";

    // 1. Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Storage Path Format: videos/{timestamp}_{uniqueId}_{originalFileName}
    const timeStamp = Date.now();
    const uniqueId = Math.random().toString(36).substring(2, 9);
    const sanitizedOriginalName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `videos/${timeStamp}_${uniqueId}_${sanitizedOriginalName}`;

    // 3. Upload file to Supabase Storage -> dance-videos bucket
    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: file.type || "video/mp4",
        upsert: true,
      });

    if (uploadErr) {
      console.error(`Storage upload error in '${BUCKET_NAME}':`, uploadErr);
      
      const isRlsError = uploadErr.message?.includes("row-level security") || (uploadErr as any)?.statusCode === "403";
      
      const userFriendlyError = isRlsError
        ? `Storage RLS Policy Violation: Please add the INSERT policy for 'dance-videos' in Supabase SQL Editor or set SUPABASE_SERVICE_ROLE_KEY in .env.local.`
        : `Video upload failed to '${BUCKET_NAME}': ${uploadErr.message}`;

      return NextResponse.json(
        { error: userFriendlyError, details: uploadErr },
        { status: 400 }
      );
    }

    const uploadedPath = uploadData?.path || filePath;

    return NextResponse.json({
      success: true,
      bucket: BUCKET_NAME,
      path: uploadedPath,
      videoPath: uploadedPath, // e.g. "videos/1723456789012_a1b2c3d_audition.mp4"
      fullStoragePath: `${BUCKET_NAME}/${uploadedPath}`,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type || "video/mp4",
    });
  } catch (err: any) {
    console.error("Video upload route error:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred during video upload." },
      { status: 500 }
    );
  }
}
