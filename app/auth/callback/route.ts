import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    try {
      const supabase = createClient();
      await supabase.auth.exchangeCodeForSession(code);
    } catch (err) {
      console.error("OAuth callback exchange error:", err);
    }
  }

  // Always safely redirect back home or next page
  return NextResponse.redirect(`${origin}${next}`);
}
