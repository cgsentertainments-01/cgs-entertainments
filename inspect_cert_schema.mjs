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

async function inspectCertTables() {
  console.log("Checking Supabase tables for certificate_templates...");
  const { data, error } = await supabase.from("certificate_templates").select("*").limit(5);
  if (error) {
    console.log("certificate_templates table query error:", error.message);
  } else {
    console.log("certificate_templates table exists! Rows:", data.length);
  }

  // Check storage buckets
  const { data: buckets, error: bucketErr } = await supabase.storage.listBuckets();
  console.log("Storage buckets:", buckets?.map((b) => b.name) || bucketErr?.message);
}

inspectCertTables();
