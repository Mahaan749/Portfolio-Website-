import HomeClient from "./home-client";
import { getPublishedProjects } from "@/lib/cms/queries";

export const revalidate = 60;

export default async function MainPage() {
  const projects = await getPublishedProjects();
  return <HomeClient projects={projects} />;
}
