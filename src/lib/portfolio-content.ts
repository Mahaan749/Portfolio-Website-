export type ManagedProject = { id: string; title: string; category: string; description: string; image?: string; liveUrl?: string; githubUrl?: string };
export type ManagedBlog = { id: string; title: string; summary: string; body: string; publishedAt: string };
export type PortfolioContent = { learningTitle: string; projectsTitle: string; certifications: string[]; topics: string[]; projects: ManagedProject[]; blogs: ManagedBlog[] };

export const defaultContent: PortfolioContent = {
  learningTitle: "What I Have Learned",
  projectsTitle: "Projects",
  certifications: [], topics: [], projects: [], blogs: [],
};

function ready() { return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY); }
export async function readContent(): Promise<PortfolioContent> {
  if (!ready()) return defaultContent;
  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/portfolio_content?id=eq.main&select=content`, { headers: { apikey: process.env.SUPABASE_SECRET_KEY! }, cache: "no-store" });
  if (!response.ok) return defaultContent;
  const rows = await response.json();
  return { ...defaultContent, ...(rows[0]?.content || {}) };
}
export async function writeContent(content: PortfolioContent) {
  if (!ready()) throw new Error("Supabase is not configured yet.");
  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/portfolio_content`, { method: "POST", headers: { apikey: process.env.SUPABASE_SECRET_KEY!, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates" }, body: JSON.stringify({ id: "main", content }) });
  if (!response.ok) throw new Error("Unable to save content to Supabase.");
}
