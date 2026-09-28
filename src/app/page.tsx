import HomeClient from "./home-client";
import { getHomeSettings, getPublishedProjects } from "@/lib/cms/queries";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function MainPage() {
  const [projects, settings] = await Promise.all([getPublishedProjects(), getHomeSettings()]);
  let isAdmin = false;
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
        isAdmin = Boolean(data);
      }
    } catch {
      isAdmin = false;
    }
  }
  return <HomeClient projects={projects} settings={settings} isAdmin={isAdmin} />;
}
