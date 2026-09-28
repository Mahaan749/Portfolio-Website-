"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { CmsProject } from "@/lib/cms/types";

export default function InlineProjectEditor({ project }: { project?: CmsProject }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: project?.title ?? "", category: project?.category ?? "Cybersecurity project", summary: project?.summary ?? "", image_url: project?.image_url ?? "", live_url: project?.live_url ?? "", github_url: project?.github_url ?? "", published: project?.published ?? true });

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const supabase = createClient();
      const file = new FormData(event.currentTarget).get("image") as File;
      let imageUrl = form.image_url;
      if (file?.size) {
        if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) throw new Error("Choose an image no larger than 5 MB.");
        const name = `${Date.now()}-${file.name.toLowerCase().replace(/[^a-z0-9.]+/g,"-")}`;
        const { error: uploadError } = await supabase.storage.from("portfolio-media").upload(name, file);
        if (uploadError) throw uploadError;
        imageUrl = supabase.storage.from("portfolio-media").getPublicUrl(name).data.publicUrl;
      }
      const payload = { ...form, image_url: imageUrl || null, live_url: form.live_url || null, github_url: form.github_url || null, sort_order: project?.sort_order ?? 0 };
      const { error: saveError } = project
        ? await supabase.from("projects").update(payload).eq("id", project.id)
        : await supabase.from("projects").insert(payload);
      if (saveError) throw saveError;
      setOpen(false); router.refresh();
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Unable to save project."); }
    finally { setBusy(false); }
  }

  const input = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";
  return <>
    <button onClick={(event) => { event.preventDefault(); event.stopPropagation(); setOpen(true); }} className="pointer-events-auto flex items-center gap-2 rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-lg">{project ? <Pencil className="size-3.5"/> : <Plus className="size-3.5"/>}{project ? "Edit" : "Add project"}</button>
    {open && <div className="pointer-events-auto fixed inset-0 z-[4000] grid place-items-center bg-black/75 p-4" onMouseDown={event => event.target === event.currentTarget && setOpen(false)}>
      <form onSubmit={save} className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl border border-border bg-background p-6 text-left">
        <div className="flex items-center justify-between"><h2 className="font-display text-2xl">{project ? "Edit project" : "Add project"}</h2><button type="button" onClick={() => setOpen(false)}><X/></button></div>
        <input required className={input} placeholder="Project title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
        <input required className={input} placeholder="Category" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}/>
        <textarea required rows={5} className={input} placeholder="Description" value={form.summary} onChange={e=>setForm({...form,summary:e.target.value})}/>
        <input className={input} placeholder="Live URL" value={form.live_url} onChange={e=>setForm({...form,live_url:e.target.value})}/>
        <input className={input} placeholder="GitHub URL" value={form.github_url} onChange={e=>setForm({...form,github_url:e.target.value})}/>
        <label className="block text-sm">Replace image<input name="image" type="file" accept="image/*" className={`${input} mt-1`}/></label>
        <label className="flex gap-2 text-sm"><input type="checkbox" checked={form.published} onChange={e=>setForm({...form,published:e.target.checked})}/> Published</label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button disabled={busy} className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground">{busy ? "Saving…" : "Save project"}</button>
      </form>
    </div>}
  </>;
}
