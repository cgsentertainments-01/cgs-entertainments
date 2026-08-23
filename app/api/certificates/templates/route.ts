import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { verifyAdminApi } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const BUCKET_NAME = "certificates";
const REGISTRY_FILE_PATH = "templates/templates_registry.json";

// Helper for storage registry fallback
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

/**
 * GET /api/certificates/templates
 * Always returns fresh templates directly from Supabase (no cache).
 */
export async function GET(request: Request) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ success: true, templates: [] });
    }

    let templates: any[] = [];

    // Try primary database query directly from Supabase
    const { data: dbTemplates, error: dbErr } = await supabase
      .from("certificate_templates")
      .select("id, name, type, background_url, font_family, primary_color, layout_config, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (!dbErr && dbTemplates && dbTemplates.length > 0) {
      templates = dbTemplates;
    } else {
      // Fallback: storage file registry
      templates = await getStoredTemplatesFromStorage(supabase);
    }

    return NextResponse.json({
      success: true,
      templates: templates || [],
    });
  } catch (err: any) {
    console.error("GET /api/certificates/templates exception:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to fetch templates", templates: [] }, { status: 500 });
  }
}

/**
 * POST /api/certificates/templates
 * Create / Save a new Ready-Made Image Certificate Template.
 */
export async function POST(request: Request) {
  try {
    const authCheck = await verifyAdminApi();
    if (!authCheck.authorized) {
      return NextResponse.json(
        { success: false, error: authCheck.error || "Unauthorized admin access" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      id,
      name,
      certificate_type = "winner",
      background_url,
      orientation = "landscape",
      is_active = true,
      configuration = {},
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: "Template Name is required" }, { status: 400 });
    }

    if (!background_url) {
      return NextResponse.json({ success: false, error: "Certificate Ready-Made Background Image is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ success: false, error: "Database connection unavailable" }, { status: 500 });
    }

    const templateId = id || `tpl_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const nowIso = new Date().toISOString();

    const templateRecord = {
      id: templateId,
      name: name.trim(),
      certificate_type: certificate_type.toLowerCase(),
      background_url,
      orientation,
      width: 1200,
      height: 850,
      configuration,
      is_active: Boolean(is_active),
      created_at: body.created_at || nowIso,
      updated_at: nowIso,
    };

    let savedTemplate: any = null;

    // Try primary database upsert
    const { data: dbSaved, error: dbErr } = await supabase
      .from("certificate_templates")
      .upsert(templateRecord)
      .select()
      .maybeSingle();

    if (!dbErr && dbSaved) {
      savedTemplate = dbSaved;
    } else {
      // Fallback: storage registry file
      const currentList = await getStoredTemplatesFromStorage(supabase);
      const existingIdx = currentList.findIndex((t: any) => t.id === templateId);

      if (existingIdx >= 0) {
        currentList[existingIdx] = templateRecord;
      } else {
        currentList.unshift(templateRecord);
      }

      await saveTemplatesToStorage(supabase, currentList);
      savedTemplate = templateRecord;
    }

    return NextResponse.json({
      success: true,
      message: "Ready-Made Certificate Template saved successfully",
      template: savedTemplate,
    });
  } catch (err: any) {
    console.error("POST /api/certificates/templates exception:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to save template" }, { status: 500 });
  }
}
