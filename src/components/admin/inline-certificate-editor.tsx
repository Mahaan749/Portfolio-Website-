"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Award, Pencil, Plus, Trash2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { CmsProject } from "@/lib/cms/types";

export default function InlineCertificateEditor({ certificate }: { certificate?: CmsProject }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: certificate?.title ?? "", summary: certificate?.summary ?? "", image_url: certificate?.image_url ?? "", sort_order: certificate?.sort_order ?? 0, published: certificate?.published ?? true });
  const input = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const supabase = createClient();
      const file = new FormData(event.currentTarget).get("image") as File;
      let imageUrl = form.image_url;
      if (file?.size) {
        if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) throw new Error("Choose an image no larger than 5 MB.");
        const name = `certificates/${Date.now()}-${file.name.toLowerCase().replace(/[^a-z0-9.]+/g,"-")}`;
        const { error: uploadError } = await supabase.storage.from("portfolio-media").upload(name, file);
        if (uploadError) throw uploadError;
        imageUrl = supabase.storage.from("portfolio-media").getPublicUrl(name).data.publicUrl;
      }
      if (!imageUrl) throw new Error("Please upload an image of the certificate.");
      const payload = { title: form.title, summary: form.summary, category: "__certificate__", image_url: imageUrl, live_url: null, github_url: null, sort_order: form.sort_order, published: form.published };
      const { error: saveError } = certificate ? await supabase.from("projects").update(payload).eq("id", certificate.id) : await supabase.from("projects").insert(payload);
      if (saveError) throw saveError;
      setOpen(false); router.refresh();
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Unable to save certificate."); }
    finally { setBusy(false); }
  }

  async function remove() {
    if (!certificate || !window.confirm(`Delete “${certificate.title}” and remove its image from the gallery?`)) return;
    setBusy(true); setError("");
    const response = await fetch("/api/admin/content", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete-project", id: certificate.id }) });
    const result = await response.json(); setBusy(false);
    if (!response.ok) return setError(result.error || "Unable to delete certificate.");
    setOpen(false); router.refresh();
  }

  return <>
    <button onClick={event => { event.preventDefault(); event.stopPropagation(); setOpen(true); }} className="pointer-events-auto flex items-center gap-2 rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-lg">{certificate ? <Pencil className="size-3.5"/> : <Plus className="size-3.5"/>}{certificate ? "Edit" : "Add certificate"}</button>
    {open && <div className="pointer-events-auto fixed inset-0 z-[4000] grid place-items-center bg-black/75 p-4" onMouseDown={event => event.target === event.currentTarget && setOpen(false)}>
      <form onSubmit={save} className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl border border-border bg-background p-6 text-left">
        <div className="flex items-center justify-between"><div className="flex items-center gap-3"><Award className="text-primary"/><h2 className="font-display text-2xl">{certificate ? "Edit certificate" : "Add certificate"}</h2></div><button type="button" onClick={() => setOpen(false)}><X/></button></div>
        <input required className={input} placeholder="Certificate title" value={form.title} onChange={e => setForm({...form,title:e.target.value})}/>
        <textarea rows={4} className={input} placeholder="Issuer, date, credential details or a short note" value={form.summary} onChange={e => setForm({...form,summary:e.target.value})}/>
        <label className="block text-sm">{certificate ? "Replace certificate image (optional)" : "Certificate image"}<input required={!certificate} name="image" type="file" accept="image/*" className={`${input} mt-1`}/></label>
        <label className="block text-sm">Display order<input type="number" className={`${input} mt-1`} value={form.sort_order} onChange={e => setForm({...form,sort_order:Number(e.target.value)})}/></label>
        <label className="flex gap-2 text-sm"><input type="checkbox" checked={form.published} onChange={e => setForm({...form,published:e.target.checked})}/> Published</label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex gap-3"><button disabled={busy} className="flex-1 rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground disabled:opacity-50">{busy ? "Saving…" : "Save certificate"}</button>{certificate && <button type="button" disabled={busy} onClick={remove} className="flex items-center gap-2 rounded-lg border border-red-500/50 px-4 py-3 font-semibold text-red-400"><Trash2 className="size-4"/> Delete</button>}</div>
      </form>
    </div>}
  </>;
}
