"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { PageSettings } from "@/lib/cms/types";
import { LogOut, Pencil, Plus, Settings, Trash2, X } from "lucide-react";

export default function PageContentToolbar({ settings, category, pageName }: { settings: PageSettings; category: "__blog_settings__" | "__news_settings__"; pageName: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(settings);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const input = "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";

  async function save(nextForm: PageSettings = form, closeAfter = true) {
    setBusy(true); setMessage("");
    const { id, title, ...content } = nextForm;
    const payload = { title, category, summary: JSON.stringify(content), image_url: null, live_url: null, github_url: null, sort_order: -998, published: true };
    const supabase = createClient();
    const { error } = id ? await supabase.from("projects").update(payload).eq("id", id) : await supabase.from("projects").insert(payload);
    setBusy(false);
    if (error) return setMessage(error.message);
    setMessage("Page content updated."); router.refresh();
    if (closeAfter) window.setTimeout(() => setOpen(false), 500);
  }

  async function logout() { await createClient().auth.signOut(); router.replace("/"); router.refresh(); }
  function addSection() { setForm({ ...form, sections: [...form.sections, { id: crypto.randomUUID(), title: "New section", body: "Add your text here." }] }); }
  async function removeSection(sectionId: string) {
    if (!window.confirm("Delete this section?")) return;
    const nextForm = { ...form, sections: form.sections.filter(item => item.id !== sectionId) };
    setForm(nextForm);
    await save(nextForm, false);
  }

  return <>
    <div className="fixed left-1/2 top-4 z-[2000] flex -translate-x-1/2 items-center gap-2 rounded-full border border-primary/30 bg-background/95 p-2 shadow-2xl backdrop-blur">
      <span className="hidden pl-3 text-xs font-semibold uppercase tracking-widest text-primary sm:block">Admin mode</span>
      <button onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"><Pencil className="size-4"/> Edit page text</button>
      <Link href="/admin" className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm"><Settings className="size-4"/> Dashboard</Link>
      <button onClick={logout} aria-label="Sign out" className="rounded-full border border-border p-2"><LogOut className="size-4"/></button>
    </div>
    {open && <div className="fixed inset-0 z-[3000] grid place-items-center bg-black/70 p-4" onMouseDown={event => event.target === event.currentTarget && setOpen(false)}>
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-background p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between"><div><p className="text-xs uppercase tracking-widest text-primary">Inline editor</p><h2 className="font-display text-2xl">{pageName}</h2></div><button onClick={() => setOpen(false)}><X/></button></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">Small label<input className={input} value={form.eyebrow} onChange={e => setForm({...form,eyebrow:e.target.value})}/></label>
          <label className="text-sm">Page title<input className={input} value={form.title} onChange={e => setForm({...form,title:e.target.value})}/></label>
          <label className="sm:col-span-2 text-sm">Description<textarea className={`${input} min-h-24`} value={form.description} onChange={e => setForm({...form,description:e.target.value})}/></label>
          {form.ctaLabel !== undefined && <label className="sm:col-span-2 text-sm">Button label<input className={input} value={form.ctaLabel} onChange={e => setForm({...form,ctaLabel:e.target.value})}/></label>}
        </div>
        <div className="my-6 flex items-center justify-between"><h3 className="font-semibold">Additional sections</h3><button onClick={addSection} className="flex items-center gap-2 rounded-full border border-primary/40 px-3 py-2 text-sm text-primary"><Plus className="size-4"/> Add section</button></div>
        <div className="space-y-4">{form.sections.map((section,index) => <div key={section.id} className="rounded-xl border border-border p-4">
          <div className="mb-3 flex justify-between"><span className="text-xs uppercase tracking-widest text-muted-foreground">Section {index + 1}</span><button disabled={busy} onClick={() => removeSection(section.id)} className="flex items-center gap-1 text-xs text-red-400 disabled:opacity-50" aria-label="Remove section"><Trash2 className="size-4"/> Delete section</button></div>
          <input className={input} value={section.title} onChange={e => setForm({...form,sections:form.sections.map(item => item.id === section.id ? {...item,title:e.target.value} : item)})}/>
          <textarea className={`${input} min-h-28`} value={section.body} onChange={e => setForm({...form,sections:form.sections.map(item => item.id === section.id ? {...item,body:e.target.value} : item)})}/>
        </div>)}</div>
        {message && <p className="mt-4 text-sm text-primary">{message}</p>}
        <button disabled={busy} onClick={() => save()} className="mt-5 w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground disabled:opacity-50">{busy ? "Saving…" : "Save changes"}</button>
      </div>
    </div>}
  </>;
}
