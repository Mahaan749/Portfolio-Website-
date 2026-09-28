import { createClient } from "@supabase/supabase-js";
import type { CmsPost, CmsProject } from "./types";

function getPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function getPublishedProjects(): Promise<CmsProject[]> {
  const supabase = getPublicClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as CmsProject[];
  } catch (error) {
    console.error("Unable to load managed projects", error);
    return [];
  }
}

export async function getPublishedPosts(): Promise<CmsPost[]> {
  const supabase = getPublicClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("published", true)
      .order("published_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as CmsPost[];
  } catch (error) {
    console.error("Unable to load managed posts", error);
    return [];
  }
}

export async function getPublishedPost(slug: string): Promise<CmsPost | null> {
  const supabase = getPublicClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();
    if (error) throw error;
    return data as CmsPost | null;
  } catch (error) {
    console.error("Unable to load managed post", error);
    return null;
  }
}
