import React from "react";
import { getBlogPosts } from "@/lib/mdx";
import BlogListClient from "./blog-list-client";
import { getPublishedPosts } from "@/lib/cms/queries";

export const metadata = {
  title: "Security Notes | Mahaan Shrestha",
  description: "Cybersecurity lab notes, lessons learned, and the occasional debugging detour.",
};

export const revalidate = 60;

export default async function BlogPage() {
  const managedPosts = (await getPublishedPosts()).map((post) => ({
    slug: post.slug,
    metadata: {
      title: post.title,
      publishedAt: post.published_at,
      summary: post.summary,
      image: post.image_url ?? undefined,
      author: post.author,
      tags: post.tags,
    },
    wordCount: post.body.trim().split(/\s+/).length,
  }));
  const localPosts = getBlogPosts()
    .sort((a, b) => {
      if (new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)) {
        return -1;
      }
      return 1;
    })
    .map((post) => ({
      slug: post.slug,
      metadata: post.metadata,
      wordCount: post.content.trim().split(/\s+/).length,
    }));

  return <BlogListClient posts={[...managedPosts, ...localPosts].sort((a, b) =>
    new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime()
  )} />;
}
