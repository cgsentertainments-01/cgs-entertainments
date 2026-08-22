import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: "Invalid file type. Supported formats: JPG, JPEG, PNG, WEBP" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit. Please compress your image." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const supabase = getSupabaseAdmin();
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "png";
    const fileName = `guest-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `guests/${fileName}`;

    const bucketName = "event-banners";

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.warn("Storage upload warning, creating base64 data fallback:", uploadError.message);
      const base64Data = `data:${file.type};base64,${buffer.toString("base64")}`;
      return NextResponse.json({ url: base64Data, fileName: file.name }, { status: 200 });
    }

    const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);

    return NextResponse.json(
      {
        url: publicUrlData.publicUrl,
        fileName: file.name,
        filePath,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("POST /api/guests-judges/upload exception:", err);
    return NextResponse.json({ error: "Internal server error during upload" }, { status: 500 });
  }
}
