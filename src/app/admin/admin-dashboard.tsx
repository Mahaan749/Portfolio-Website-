"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { CmsPost, CmsProject, ContactSubmission } from "@/lib/cms/types";
import { Mail, MailOpen, Trash2 } from "lucide-react";

type Section = "projects" | "posts" | "messages";

const emptyProject = { title: "", category: "Cybersecurity project", summary: "", image_url: "", live_url: "", github_url: "", sort_order: 0, published: true };
const emptyPost = { title: "", slug: "", summary: "", body: "", image_url: "", author: "Mahaan Shrestha", tags: "cybersecurity", published: true };

export default function AdminDashboard({ initialProjects, initialPosts, initialMessages, messagesReady, email }: { initialProjects: CmsProject[]; initialPosts: CmsPost[]; initialMessages: ContactSubmission[]; messagesReady: boolean; email: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [section, setSection] = useState<Section>("projects");
  const [projects, setProjects] = useState(initialProjects);
  const [posts, setPosts] = useState(initialPosts);
  const [messages, setMessages] = useState(initialMessages);
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
    const [{ data: nextProjects }, { data: nextPosts }, { data: nextMessages }] = await Promise.all([
      supabase.from("projects").select("*").order("sort_order"),
      supabase.from("posts").select("*").order("published_at", { ascending: false }),
      supabase.from("contact_submissions").select("*").order("created_at", { ascending: false }),
    ]);
    setProjects((nextProjects ?? []) as CmsProject[]); setPosts((nextPosts ?? []) as CmsPost[]); setMessages((nextMessages ?? []) as ContactSubmission[]); router.refresh();
  }

  async function remove(table: "projects" | "posts", id: string) {
    if (!window.confirm("Delete this item permanently?")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    setNotice(error ? error.message : "Item deleted."); if (!error) await refresh();
  }

  async function logout() { await supabase.auth.signOut(); router.replace("/admin/login"); router.refresh(); }

  async function markMessage(message: ContactSubmission, status: "read" | "unread") {
    const { error } = await supabase.from("contact_submissions").update({ status }).eq("id", message.id);
    if (error) return setNotice(error.message);
    setMessages(current => current.map(item => item.id === message.id ? {...item,status} : item));
  }

  async function removeMessage(message: ContactSubmission) {
    if (!window.confirm(`Delete the message from ${message.full_name}?`)) return;
    const { error } = await supabase.from("contact_submissions").delete().eq("id", message.id);
    if (error) return setNotice(error.message);
    setMessages(current => current.filter(item => item.id !== message.id)); setNotice("Message deleted.");
  }

  const input = "w-full rounded-lg border border-border bg-background px-3 py-2";
  return (
    <main className="min-h-screen bg-background px-4 py-24 text-foreground">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div><p className="text-xs uppercase tracking-[0.2em] text-primary">Portfolio CMS</p><h1 className="font-display text-4xl">Content manager</h1><p className="text-muted-foreground">Signed in as {email}</p></div>
          <div className="flex gap-3"><Link href="/" className="rounded-lg border border-border px-4 py-2">View website</Link><button onClick={logout} className="rounded-lg bg-muted px-4 py-2">Sign out</button></div>
        </div>
        <div className="mb-8 flex flex-wrap gap-2"><button onClick={() => { setSection("projects"); setEditingId(null); }} className={`rounded-full px-5 py-2 ${section === "projects" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>Projects</button><button onClick={() => { setSection("posts"); setEditingId(null); }} className={`rounded-full px-5 py-2 ${section === "posts" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>Blog posts</button><button onClick={() => { setSection("messages"); setEditingId(null); }} className={`flex items-center gap-2 rounded-full px-5 py-2 ${section === "messages" ? "bg-primary text-primary-foreground" : "bg-muted"}`}><Mail className="size-4"/> Messages{messages.filter(item => item.status === "unread").length > 0 && <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">{messages.filter(item => item.status === "unread").length}</span>}</button></div>
        {notice && <p className="mb-5 rounded-lg border border-border bg-card p-3">{notice}</p>}
        <div className={section === "messages" ? "block" : "grid gap-8 lg:grid-cols-[1fr_1.25fr]"}>
          {section === "messages" ? null : section === "projects" ? (
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
          {section === "messages" ? <div className="space-y-4">
            {!messagesReady && <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-5 text-amber-200">The contact inbox database migration has not been applied yet.</div>}
            {messages.map(message => <article key={message.id} className={`rounded-2xl border p-5 ${message.status === "unread" ? "border-primary/50 bg-primary/5" : "border-border bg-card/30"}`}>
              <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="mb-1 flex items-center gap-2">{message.status === "unread" ? <Mail className="size-4 text-primary"/> : <MailOpen className="size-4 text-muted-foreground"/>}<h3 className="font-semibold">{message.full_name}</h3>{message.status === "unread" && <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">New</span>}</div><a className="text-sm text-primary hover:underline" href={`mailto:${message.email}`}>{message.email}</a><p className="mt-1 text-xs text-muted-foreground">{new Date(message.created_at).toLocaleString()}</p></div><div className="flex gap-2"><button onClick={() => markMessage(message,message.status === "unread" ? "read" : "unread")} className="rounded-lg border border-border px-3 py-2 text-xs">Mark {message.status === "unread" ? "read" : "unread"}</button><button onClick={() => removeMessage(message)} className="rounded-lg border border-red-500/40 p-2 text-red-400" aria-label="Delete message"><Trash2 className="size-4"/></button></div></div>
              <p className="mt-5 whitespace-pre-wrap rounded-xl border border-border/60 bg-background/50 p-4 leading-relaxed">{message.message}</p>
            </article>)}
            {messagesReady && messages.length === 0 && <p className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">No messages yet. New contact submissions will appear here.</p>}
          </div> : <div className="space-y-3">
            {(section === "projects" ? projects : posts).map(item => <div key={item.id} className="flex items-start justify-between gap-4 rounded-xl border border-border bg-card/30 p-4"><div><h3 className="font-semibold">{item.title}</h3><p className="line-clamp-2 text-sm text-muted-foreground">{item.summary}</p><span className="text-xs text-primary">{item.published ? "Published" : "Draft"}</span></div><div className="flex gap-2"><button className="rounded border border-border px-3 py-1 text-sm" onClick={() => { setEditingId(item.id); if (section === "projects") { const p=item as CmsProject; setProjectForm({title:p.title,category:p.category,summary:p.summary,image_url:p.image_url??"",live_url:p.live_url??"",github_url:p.github_url??"",sort_order:p.sort_order,published:p.published}); } else { const p=item as CmsPost; setPostForm({title:p.title,slug:p.slug,summary:p.summary,body:p.body,image_url:p.image_url??"",author:p.author,tags:p.tags.join(", "),published:p.published}); } }}>Edit</button><button className="rounded border border-red-500/40 px-3 py-1 text-sm text-red-400" onClick={() => remove(section, item.id)}>Delete</button></div></div>)}
            {(section === "projects" ? projects : posts).length === 0 && <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">Nothing here yet. Add your first item.</p>}
          </div>}
        </div>
      </div>
    </main>
  );
}
