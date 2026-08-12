import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { verifyAdminApi } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const authCheck = await verifyAdminApi();
    if (!authCheck.authorized) {
      return NextResponse.json(
        { success: false, error: authCheck.error || "Unauthorized admin access" },
        { status: 401 }
      );
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ success: false, error: "Database connection unavailable" }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "templates";

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided for upload" }, { status: 400 });
    }

    // Validate image format
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"];
    if (!validTypes.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: "Invalid file type. Supported formats: PNG, JPG, JPEG, WEBP." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split(".").pop() || "png";
    const filename = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const BUCKET_NAME = "certificates";

    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadErr) {
      console.error("Certificate image upload error:", uploadErr);
      return NextResponse.json({ success: false, error: uploadErr.message }, { status: 500 });
    }

    const { data: pubData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filename);
    const publicUrl = pubData?.publicUrl || null;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: filename,
    });
  } catch (err: any) {
    console.error("POST /api/certificates/upload exception:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to upload certificate asset" }, { status: 500 });
  }
}
