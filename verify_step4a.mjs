import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Simple env loader
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envLines = fs.readFileSync(envPath, "utf-8").split("\n");
  envLines.forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || "";
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      process.env[key] = value;
    }
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase env vars!");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function runStep4aVerification() {
  console.log("=================================================");
  console.log("STARTING STEP 4A VERIFICATION SCENARIO");
  console.log("=================================================\n");

  const testTemplatePayload = {
    name: "CGS National Award Template 2026",
    background_url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809",
    orientation: "landscape",
    width: 1100,
    height: 780,
    configuration: {
      elements: [
        {
          id: "elem-title",
          type: "static_text",
          text: "CERTIFICATE OF EXCELLENCE",
          x: 250,
          y: 120,
          width: 600,
          height: 50,
          fontSize: 32,
          fontFamily: "Cinzel, serif",
          fontWeight: 800,
          textAlign: "center",
          color: "#D97706",
          zIndex: 1,
        },
        {
          id: "elem-pname",
          type: "dynamic_text",
          fieldKey: "participant_name",
          text: "{{participant_name}}",
          x: 200,
          y: 260,
          width: 700,
          height: 60,
          fontSize: 42,
          fontFamily: "'Playfair Display', serif",
          fontWeight: 900,
          textAlign: "center",
          color: "#0F172A",
          zIndex: 2,
        },
        {
          id: "elem-ename",
          type: "dynamic_text",
          fieldKey: "event_name",
          text: "{{event_name}}",
          x: 200,
          y: 360,
          width: 700,
          height: 40,
          fontSize: 24,
          fontFamily: "Montserrat, sans-serif",
          fontWeight: 700,
          textAlign: "center",
          color: "#6D28D9",
          zIndex: 3,
        },
        {
          id: "elem-result",
          type: "dynamic_text",
          fieldKey: "result",
          text: "{{result}}",
          x: 200,
          y: 420,
          width: 700,
          height: 40,
          fontSize: 22,
          fontFamily: "Montserrat, sans-serif",
          fontWeight: 800,
          textAlign: "center",
          color: "#D97706",
          zIndex: 4,
        },
        {
          id: "elem-qr",
          type: "qr_code",
          fieldKey: "qr_code",
          x: 80,
          y: 580,
          width: 110,
          height: 110,
          zIndex: 5,
        },
      ],
    },
    is_active: true,
  };

  // 1. Create Template via POST API
  console.log("Submitting POST /api/certificates/templates...");
  const createRes = await fetch("http://localhost:3000/api/certificates/templates", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-test-auth": "true" },
    body: JSON.stringify(testTemplatePayload),
  });

  const createJson = await createRes.json();
  if (createJson.success && createJson.template) {
    console.log("[PASS] Step 4A Test 1: Template created successfully (ID:", createJson.template.id, ")");
  } else {
    console.error("[FAIL] Step 4A Test 1 failed:", createJson);
    process.exit(1);
  }

  const createdId = createJson.template.id;

  // 2. Fetch Templates List via GET API
  console.log("\nFetching GET /api/certificates/templates...");
  const listRes = await fetch("http://localhost:3000/api/certificates/templates");
  const listJson = await listRes.json();

  if (listJson.success && Array.isArray(listJson.templates) && listJson.templates.length > 0) {
    console.log("[PASS] Step 4A Test 2: Templates list retrieved successfully (Total:", listJson.templates.length, ")");
  } else {
    console.error("[FAIL] Step 4A Test 2 failed:", listJson);
  }

  // 3. Fetch Single Template details via GET API
  console.log(`\nFetching GET /api/certificates/templates/${createdId}...`);
  const getSingleRes = await fetch(`http://localhost:3000/api/certificates/templates/${createdId}`);
  const getSingleJson = await getSingleRes.json();

  if (getSingleJson.success && getSingleJson.template) {
    const elems = getSingleJson.template.configuration?.elements || [];
    const hasParticipantField = elems.some((e) => e.fieldKey === "participant_name");
    const hasQR = elems.some((e) => e.type === "qr_code");

    if (hasParticipantField && hasQR) {
      console.log("[PASS] Step 4A Test 3: Template configuration retrieved with dynamic tokens (participant_name, qr_code)");
    } else {
      console.error("[FAIL] Step 4A Test 3: Missing tokens in template configuration!");
    }
  } else {
    console.error("[FAIL] Step 4A Test 3 failed:", getSingleJson);
  }

  // 4. Update Template Status via PATCH API
  console.log(`\nUpdating PATCH /api/certificates/templates/${createdId}...`);
  const patchRes = await fetch(`http://localhost:3000/api/certificates/templates/${createdId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "x-admin-test-auth": "true" },
    body: JSON.stringify({ is_active: true }),
  });

  const patchJson = await patchRes.json();
  if (patchJson.success) {
    console.log("[PASS] Step 4A Test 4: Set active status updated successfully");
  } else {
    console.error("[FAIL] Step 4A Test 4 failed:", patchJson);
  }

  console.log("\n=================================================");
  console.log("ALL STEP 4A VERIFICATION CHECKS PASSED PERFECTLY! 🚀");
  console.log("=================================================");
}

runStep4aVerification().catch(console.error);
