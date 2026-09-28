import { createClient } from "@supabase/supabase-js";
import type { CmsPost, CmsProject, HomeSettings } from "./types";

export const defaultHomeSettings: HomeSettings = {
  author: "Mahaan Shrestha",
  heroIntro: "Hi, I am",
  heroSubtitle: "Cyber Security Student · Interested in GRC and Defensive Security",
  skillsTitle: "Tech Arsenal",
  experienceTitle: "What I Have Learned",
  experienceDescription: "Education, certifications and practical study.",
  projectsTitle: "Projects",
  contactTitle: "START A CONVERSATION",
};

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
      .neq("category", "__site_settings__")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as CmsProject[];
  } catch (error) {
    console.error("Unable to load managed projects", error);
    return [];
  }
}

export async function getHomeSettings(): Promise<HomeSettings> {
  const supabase = getPublicClient();
  if (!supabase) return defaultHomeSettings;
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("id,title,summary")
      .eq("category", "__site_settings__")
      .eq("published", true)
      .maybeSingle();
    if (error || !data) return defaultHomeSettings;
    const saved = JSON.parse(data.summary || "{}") as Partial<HomeSettings>;
    return { ...defaultHomeSettings, ...saved, id: data.id, author: data.title || defaultHomeSettings.author };
  } catch {
    return defaultHomeSettings;
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
