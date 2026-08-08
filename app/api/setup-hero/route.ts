import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const src = path.join(
      "C:\\Users\\Rathod Rahul\\.gemini\\antigravity-ide\\brain\\c6f5ef77-8033-4a86-ba82-de7a0d262926",
      "hero_dancer_v2_1786095832245.png"
    );
    const destDir = path.join(process.cwd(), "public", "images", "hero");
    const dest = path.join(destDir, "hero-dancer.png");

    fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(src, dest);

    return NextResponse.json({ success: true, message: "Hero image v2 copied!", src, dest });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

