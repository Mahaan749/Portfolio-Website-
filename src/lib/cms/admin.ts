import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export async function getIsAdmin() {
  if (!isSupabaseConfigured()) return false;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { data } = await supabase.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
    return Boolean(data);
  } catch { return false; }
}
