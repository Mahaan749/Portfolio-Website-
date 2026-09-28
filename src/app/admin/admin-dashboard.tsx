"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { CmsPost, CmsProject } from "@/lib/cms/types";

type Section = "projects" | "posts";

const emptyProject = { title: "", category: "Cybersecurity project", summary: "", image_url: "", live_url: "", github_url: "", sort_order: 0, published: true };
const emptyPost = { title: "", slug: "", summary: "", body: "", image_url: "", author: "Mahaan Shrestha", tags: "cybersecurity", published: true };

export default function AdminDashboard({ initialProjects, initialPosts, email }: { initialProjects: CmsProject[]; initialPosts: CmsPost[]; email: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [section, setSection] = useState<Section>("projects");
  const [projects, setProjects] = useState(initialProjects);
  const [posts, setPosts] = useState(initialPosts);
  const [projectForm, setProjectForm] = useState({ ...emptyProject });
  const [postForm, setPostForm] = useState({ ...emptyPost });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function uploadImage(file?: File) {
    if (!file) return "";
    if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
    if (file.size > 5 * 1024 * 1024) throw new Error("Images must be 5 MB or smaller.");
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
    const path = `${Date.now()}-${safeName}`;
    const { error } = await supabase.storage.from("portfolio-media").upload(path, file);
    if (error) throw error;
    return supabase.storage.from("portfolio-media").getPublicUrl(path).data.publicUrl;
  }

  async function saveProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setNotice("");
    try {
      const file = new FormData(event.currentTarget).get("image") as File;
      const uploaded = file?.size ? await uploadImage(file) : "";
      const payload = { ...projectForm, image_url: uploaded || projectForm.image_url || null, live_url: projectForm.live_url || null, github_url: projectForm.github_url || null };
      const query = editingId ? supabase.from("projects").update(payload).eq("id", editingId) : supabase.from("projects").insert(payload);
      const { error } = await query; if (error) throw error;
      setProjectForm({ ...emptyProject }); setEditingId(null); setNotice("Project saved."); await refresh();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Unable to save project."); } finally { setBusy(false); }
  }

  async function savePost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setNotice("");
    try {
      const file = new FormData(event.currentTarget).get("image") as File;
      const uploaded = file?.size ? await uploadImage(file) : "";
      const payload = { ...postForm, slug: postForm.slug || postForm.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""), image_url: uploaded || postForm.image_url || null, tags: postForm.tags.split(",").map((tag) => tag.trim()).filter(Boolean), published_at: new Date().toISOString() };
      const query = editingId ? supabase.from("posts").update(payload).eq("id", editingId) : supabase.from("posts").insert(payload);
      const { error } = await query; if (error) throw error;
      setPostForm({ ...emptyPost }); setEditingId(null); setNotice("Blog post saved."); await refresh();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Unable to save post."); } finally { setBusy(false); }
  }

  async function refresh() {
    const [{ data: nextProjects }, { data: nextPosts }] = await Promise.all([
      supabase.from("projects").select("*").order("sort_order"),
      supabase.from("posts").select("*").order("published_at", { ascending: false }),
    ]);
    setProjects((nextProjects ?? []) as CmsProject[]); setPosts((nextPosts ?? []) as CmsPost[]); router.refresh();
  }

  async function remove(table: "projects" | "posts", id: string) {
    if (!window.confirm("Delete this item permanently?")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    setNotice(error ? error.message : "Item deleted."); if (!error) await refresh();
  }

  async function logout() { await supabase.auth.signOut(); router.replace("/admin/login"); router.refresh(); }

  const input = "w-full rounded-lg border border-border bg-background px-3 py-2";
  return (
    <main className="min-h-screen bg-background px-4 py-24 text-foreground">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div><p className="text-xs uppercase tracking-[0.2em] text-primary">Portfolio CMS</p><h1 className="font-display text-4xl">Content manager</h1><p className="text-muted-foreground">Signed in as {email}</p></div>
          <div className="flex gap-3"><Link href="/" className="rounded-lg border border-border px-4 py-2">View website</Link><button onClick={logout} className="rounded-lg bg-muted px-4 py-2">Sign out</button></div>
        </div>
        <div className="mb-8 flex gap-2"><button onClick={() => { setSection("projects"); setEditingId(null); }} className={`rounded-full px-5 py-2 ${section === "projects" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>Projects</button><button onClick={() => { setSection("posts"); setEditingId(null); }} className={`rounded-full px-5 py-2 ${section === "posts" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>Blog posts</button></div>
        {notice && <p className="mb-5 rounded-lg border border-border bg-card p-3">{notice}</p>}
        <div className="grid gap-8 lg:grid-cols-[1fr_1.25fr]">
          {section === "projects" ? (
            <form onSubmit={saveProject} className="space-y-4 rounded-2xl border border-border p-6">
              <h2 className="font-display text-2xl">{editingId ? "Edit project" : "Add project"}</h2>
              <input required placeholder="Project title" className={input} value={projectForm.title} onChange={e => setProjectForm({...projectForm, title:e.target.value})}/>
              <input required placeholder="Category" className={input} value={projectForm.category} onChange={e => setProjectForm({...projectForm, category:e.target.value})}/>
              <textarea required placeholder="Description" rows={6} className={input} value={projectForm.summary} onChange={e => setProjectForm({...projectForm, summary:e.target.value})}/>
              <input placeholder="Live URL" className={input} value={projectForm.live_url} onChange={e => setProjectForm({...projectForm, live_url:e.target.value})}/>
              <input placeholder="GitHub URL" className={input} value={projectForm.github_url} onChange={e => setProjectForm({...projectForm, github_url:e.target.value})}/>
              <label className="block text-sm">Project image<input name="image" type="file" accept="image/*" className={`${input} mt-2`}/></label>
              <label className="flex gap-2"><input type="checkbox" checked={projectForm.published} onChange={e => setProjectForm({...projectForm, published:e.target.checked})}/> Published</label>
              <button disabled={busy} className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground">{busy ? "Saving…" : "Save project"}</button>
            </form>
          ) : (
            <form onSubmit={savePost} className="space-y-4 rounded-2xl border border-border p-6">
              <h2 className="font-display text-2xl">{editingId ? "Edit blog post" : "Add blog post"}</h2>
              <input required placeholder="Post title" className={input} value={postForm.title} onChange={e => setPostForm({...postForm, title:e.target.value})}/>
              <input placeholder="URL slug (optional)" className={input} value={postForm.slug} onChange={e => setPostForm({...postForm, slug:e.target.value})}/>
              <textarea required placeholder="Short summary" rows={3} className={input} value={postForm.summary} onChange={e => setPostForm({...postForm, summary:e.target.value})}/>
              <textarea required placeholder="Article content (Markdown supported)" rows={12} className={input} value={postForm.body} onChange={e => setPostForm({...postForm, body:e.target.value})}/>
              <input placeholder="Tags, separated by commas" className={input} value={postForm.tags} onChange={e => setPostForm({...postForm, tags:e.target.value})}/>
              <label className="block text-sm">Cover image<input name="image" type="file" accept="image/*" className={`${input} mt-2`}/></label>
              <label className="flex gap-2"><input type="checkbox" checked={postForm.published} onChange={e => setPostForm({...postForm, published:e.target.checked})}/> Published</label>
              <button disabled={busy} className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground">{busy ? "Saving…" : "Save blog post"}</button>
            </form>
          )}
          <div className="space-y-3">
            {(section === "projects" ? projects : posts).map(item => <div key={item.id} className="flex items-start justify-between gap-4 rounded-xl border border-border bg-card/30 p-4"><div><h3 className="font-semibold">{item.title}</h3><p className="line-clamp-2 text-sm text-muted-foreground">{item.summary}</p><span className="text-xs text-primary">{item.published ? "Published" : "Draft"}</span></div><div className="flex gap-2"><button className="rounded border border-border px-3 py-1 text-sm" onClick={() => { setEditingId(item.id); if (section === "projects") { const p=item as CmsProject; setProjectForm({title:p.title,category:p.category,summary:p.summary,image_url:p.image_url??"",live_url:p.live_url??"",github_url:p.github_url??"",sort_order:p.sort_order,published:p.published}); } else { const p=item as CmsPost; setPostForm({title:p.title,slug:p.slug,summary:p.summary,body:p.body,image_url:p.image_url??"",author:p.author,tags:p.tags.join(", "),published:p.published}); } }}>Edit</button><button className="rounded border border-red-500/40 px-3 py-1 text-sm text-red-400" onClick={() => remove(section, item.id)}>Delete</button></div></div>)}
            {(section === "projects" ? projects : posts).length === 0 && <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">Nothing here yet. Add your first item.</p>}
          </div>
        </div>
      </div>
    </main>
  );
}
