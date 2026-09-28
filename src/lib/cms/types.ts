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
