export type CmsProject = {
  id: string;
  title: string;
  category: string;
  summary: string;
  image_url: string | null;
  live_url: string | null;
  github_url: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type CmsPost = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  image_url: string | null;
  author: string;
  tags: string[];
  published_at: string;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type HomeSettings = {
  id?: string;
  author: string;
  heroIntro: string;
  heroSubtitle: string;
  skillsTitle: string;
  experienceTitle: string;
  experienceDescription: string;
  projectsTitle: string;
  contactTitle: string;
  educationLabel: string;
  educationTitle: string;
  educationInstitution: string;
  educationPeriod: string;
  certificationsTitle: string;
  certifications: string[];
  topicsTitle: string;
  topics: string[];
  hiddenProjectIds: string[];
};

export type CustomSection = { id: string; title: string; body: string };

export type PageSettings = {
  id?: string;
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel?: string;
  sections: CustomSection[];
  hiddenPostSlugs?: string[];
};
