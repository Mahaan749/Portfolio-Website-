import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Action = "delete-project" | "hide-project" | "delete-post" | "hide-post";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { action?: Action; id?: string; slug?: string };
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Your admin session has expired. Sign in again." }, { status: 401 });
    const { data: admin } = await supabase.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
    if (!admin) return NextResponse.json({ error: "This account is not authorised as an administrator." }, { status: 403 });

    if (body.action === "delete-project" && body.id) {
      const { error } = await supabase.from("projects").delete().eq("id", body.id);
      if (error) throw error;
    } else if (body.action === "delete-post" && body.id) {
      const { error } = await supabase.from("posts").delete().eq("id", body.id);
      if (error) throw error;
    } else if ((body.action === "hide-project" && body.id) || (body.action === "hide-post" && body.slug)) {
      const category = body.action === "hide-project" ? "__site_settings__" : "__blog_settings__";
      const key = body.action === "hide-project" ? "hiddenProjectIds" : "hiddenPostSlugs";
      const value = body.action === "hide-project" ? body.id : body.slug;
      const { data: record, error: readError } = await supabase.from("projects").select("id,title,summary").eq("category", category).maybeSingle();
      if (readError) throw readError;
      const content = record ? JSON.parse(record.summary || "{}") : {};
      const values = Array.isArray(content[key]) ? content[key] : [];
      content[key] = Array.from(new Set([...values, value]));
      const payload = { title: record?.title || (category === "__site_settings__" ? "Mahaan Shrestha" : "Blog Section"), category, summary: JSON.stringify(content), image_url: null, live_url: null, github_url: null, sort_order: -999, published: true };
      const { error } = record ? await supabase.from("projects").update(payload).eq("id", record.id) : await supabase.from("projects").insert(payload);
      if (error) throw error;
    } else {
      return NextResponse.json({ error: "Invalid content action." }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update content." }, { status: 500 });
  }
}
