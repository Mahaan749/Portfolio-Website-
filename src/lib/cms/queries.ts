import { createClient } from "@supabase/supabase-js";
import type { CmsPost, CmsProject, HomeSettings, PageSettings } from "./types";

export const defaultHomeSettings: HomeSettings = {
  author: "Mahaan Shrestha",
  heroIntro: "Hi, I am",
  heroSubtitle: "Cyber Security Student · Interested in GRC and Defensive Security",
  skillsTitle: "Tech Arsenal",
  experienceTitle: "What I Have Learned",
  experienceDescription: "Education, certifications and practical study.",
  projectsTitle: "Projects",
  contactTitle: "START A CONVERSATION",
  educationLabel: "Education",
  educationTitle: "BSc (Hons) Ethical Hacking and Cyber Security",
  educationInstitution: "Softwarica College of IT & E-Commerce, delivered with Coventry University",
  educationPeriod: "2024 - Present · Fourth Semester",
  certificationsTitle: "Certifications & Training",
  certifications: ["Certified SOC Practitioner Fundamentals - CyberExam", "GRC Fundamentals and Certified GRC Practitioner - CyberExam", "ISO/IEC 27001:2022 Information Security Associate - SkillFront", "Foundations of Log Analysis for Cyber Defense - Red Team Leaders", "Certified LLM Security Professional - Red Team Leaders", "TryHackMe Pre-Security Learning Path", "ISC2 Certified in Cybersecurity coursework - exam preparation in progress"],
  topicsTitle: "Topics Studied",
  topics: ["Networking, TCP/IP and DNS", "Windows and Linux fundamentals", "Log analysis and alert triage", "Web security and authorised testing", "Incident documentation and evidence collection", "MITRE ATT&CK awareness", "ISO 27001, risk and policy fundamentals", "Python and Git fundamentals"],
  hiddenProjectIds: [],
};

export const defaultBlogSettings: PageSettings = { eyebrow: "Lab journal", title: "Blog Section", description: "Security notes, lessons learned, and debugging stories with the panic edited out.", sections: [], hiddenPostSlugs: [] };
export const defaultNewsletterSettings: PageSettings = { eyebrow: "Newsletter", title: "Field notes, minus the noise.", description: "Short updates about cybersecurity labs, defensive techniques and what I am learning. The mailing list is being prepared.", ctaLabel: "Ask me for updates", sections: [] };

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
      .not("category", "like", "__%")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as CmsProject[];
  } catch (error) {
    console.error("Unable to load managed projects", error);
    return [];
  }
}

export async function getPageSettings(category: "__blog_settings__" | "__news_settings__", defaults: PageSettings): Promise<PageSettings> {
  const supabase = getPublicClient();
  if (!supabase) return defaults;
  try {
    const { data, error } = await supabase.from("projects").select("id,title,summary").eq("category", category).eq("published", true).maybeSingle();
    if (error || !data) return defaults;
    const saved = JSON.parse(data.summary || "{}") as Partial<PageSettings>;
    return { ...defaults, ...saved, id: data.id, title: data.title || defaults.title, sections: Array.isArray(saved.sections) ? saved.sections : [] };
  } catch { return defaults; }
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
