import HomeClient from "./home-client";
import { getHomeSettings, getPublishedCertificates, getPublishedProjects } from "@/lib/cms/queries";
import { getIsAdmin } from "@/lib/cms/admin";

export const dynamic = "force-dynamic";

export default async function MainPage() {
  const [projects, certificates, settings] = await Promise.all([getPublishedProjects(), getPublishedCertificates(), getHomeSettings()]);
  const isAdmin = await getIsAdmin();
  return <HomeClient projects={projects} certificates={certificates} settings={settings} isAdmin={isAdmin} />;
}
