import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { verifyAdminApi } from "@/lib/supabase/server";

const BUCKET_NAME = "certificates";
const REGISTRY_FILE_PATH = "templates/templates_registry.json";

async function getStoredTemplatesFromStorage(supabase: any) {
  try {
    const { data, error } = await supabase.storage.from(BUCKET_NAME).download(REGISTRY_FILE_PATH);
    if (error || !data) return [];
    const text = await data.text();
    return JSON.parse(text) || [];
  } catch {
    return [];
  }
}

async function saveTemplatesToStorage(supabase: any, templatesList: any[]) {
  try {
    const jsonBuffer = Buffer.from(JSON.stringify(templatesList, null, 2));
    await supabase.storage.from(BUCKET_NAME).upload(REGISTRY_FILE_PATH, jsonBuffer, {
      contentType: "application/json",
      upsert: true,
    });
  } catch (err) {
    console.warn("Storage fallback save error:", err);
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });
    }

    // Try primary database lookup
    const { data: dbTemplate } = await supabase
      .from("certificate_templates")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (dbTemplate) {
      return NextResponse.json({ success: true, template: dbTemplate });
    }

    // Fallback: search storage registry file
    const templatesList = await getStoredTemplatesFromStorage(supabase);
    const found = templatesList.find((t: any) => t.id === id);

    if (found) {
      return NextResponse.json({ success: true, template: found });
    }

    return NextResponse.json({ success: false, error: "Certificate template not found" }, { status: 404 });
  } catch (err: any) {
    console.error("GET /api/certificates/templates/[id] exception:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await verifyAdminApi();
    if (!authCheck.authorized) {
      return NextResponse.json({ success: false, error: "Unauthorized admin access" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });
    }

    // Primary DB update
    const { data: dbUpdated } = await supabase
      .from("certificate_templates")
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .maybeSingle();

    let finalTemplate = dbUpdated;

    // Fallback storage update
    const templatesList = await getStoredTemplatesFromStorage(supabase);
    const idx = templatesList.findIndex((t: any) => t.id === id);

    if (body.is_active) {
      templatesList.forEach((t: any) => (t.is_active = false));
    }

    if (idx >= 0) {
      templatesList[idx] = { ...templatesList[idx], ...body, updated_at: new Date().toISOString() };
      if (!finalTemplate) finalTemplate = templatesList[idx];
      await saveTemplatesToStorage(supabase, templatesList);
    }

    return NextResponse.json({
      success: true,
      message: "Template updated successfully",
      template: finalTemplate,
    });
  } catch (err: any) {
    console.error("PATCH /api/certificates/templates/[id] exception:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await verifyAdminApi();
    if (!authCheck.authorized) {
      return NextResponse.json({ success: false, error: "Unauthorized admin access" }, { status: 401 });
    }

    const { id } = await params;
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });
    }

    // DB delete
    await supabase.from("certificate_templates").delete().eq("id", id);

    // Storage fallback delete
    const templatesList = await getStoredTemplatesFromStorage(supabase);
    const filteredList = templatesList.filter((t: any) => t.id !== id);
    await saveTemplatesToStorage(supabase, filteredList);

    return NextResponse.json({
      success: true,
      message: "Certificate template deleted successfully",
    });
  } catch (err: any) {
    console.error("DELETE /api/certificates/templates/[id] exception:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
