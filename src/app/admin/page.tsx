import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import AdminDashboard from "./admin-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!isSupabaseConfigured()) redirect("/admin/login");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: admin } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!admin) redirect("/admin/login?error=not-authorized");

  const [{ data: projects }, { data: posts }, { data: messages, error: messagesError }] = await Promise.all([
    supabase.from("projects").select("*").order("sort_order"),
    supabase.from("posts").select("*").order("published_at", { ascending: false }),
    supabase.from("contact_submissions").select("*").order("created_at", { ascending: false }),
  ]);

  return <AdminDashboard initialProjects={projects ?? []} initialPosts={posts ?? []} initialMessages={messages ?? []} messagesReady={!messagesError} email={user.email ?? "Admin"} />;
}
