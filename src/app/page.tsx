import HomeClient from "./home-client";
import { getHomeSettings, getPublishedProjects } from "@/lib/cms/queries";
import { getIsAdmin } from "@/lib/cms/admin";

export const dynamic = "force-dynamic";

export default async function MainPage() {
  const [projects, settings] = await Promise.all([getPublishedProjects(), getHomeSettings()]);
  const isAdmin = await getIsAdmin();
  return <HomeClient projects={projects} settings={settings} isAdmin={isAdmin} />;
}
