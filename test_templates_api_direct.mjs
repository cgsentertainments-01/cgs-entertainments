import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

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

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testStorageFallback() {
  console.log("Testing Supabase Storage fallback for certificate templates...");
  const BUCKET_NAME = "certificates";
  const REGISTRY_FILE_PATH = "templates/templates_registry.json";

  const sampleTemplate = {
    id: `tpl_test_${Date.now()}`,
    name: "National Excellence Certificate 2026",
    background_url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809",
    orientation: "landscape",
    width: 1100,
    height: 780,
    configuration: {
      elements: [
        { id: "e1", type: "static_text", text: "CERTIFICATE OF EXCELLENCE", x: 250, y: 120, width: 600, height: 50 },
        { id: "e2", type: "dynamic_text", fieldKey: "participant_name", text: "{{participant_name}}", x: 200, y: 260, width: 700, height: 60 },
        { id: "e3", type: "dynamic_text", fieldKey: "event_name", text: "{{event_name}}", x: 200, y: 360, width: 700, height: 40 },
        { id: "e4", type: "qr_code", fieldKey: "qr_code", x: 80, y: 580, width: 110, height: 110 },
      ],
    },
    is_active: true,
    created_at: new Date().toISOString(),
  };

  const buffer = Buffer.from(JSON.stringify([sampleTemplate], null, 2));
  const { data: uploadData, error: uploadErr } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(REGISTRY_FILE_PATH, buffer, { contentType: "application/json", upsert: true });

  if (uploadErr) {
    console.error("Storage upload error:", uploadErr);
    return;
  }
  console.log("[PASS] Template saved to Supabase storage successfully:", uploadData.path);

  const { data: downData, error: downErr } = await supabase.storage.from(BUCKET_NAME).download(REGISTRY_FILE_PATH);
  if (downErr) {
    console.error("Storage download error:", downErr);
    return;
  }

  const text = await downData.text();
  const templatesList = JSON.parse(text);
  console.log("[PASS] Downloaded template list count:", templatesList.length);
  console.log("[PASS] Saved template name:", templatesList[0].name);
}

testStorageFallback();
