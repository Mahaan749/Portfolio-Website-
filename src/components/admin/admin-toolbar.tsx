"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { HomeSettings } from "@/lib/cms/types";
import { Pencil, Settings, LogOut, Plus, Trash2, X } from "lucide-react";

export default function AdminToolbar({ settings }: { settings: HomeSettings }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(settings);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener("open-homepage-editor", show);
    return () => window.removeEventListener("open-homepage-editor", show);
  }, []);

  async function save() {
    setBusy(true); setMessage("");
    const supabase = createClient();
    const { id, author, ...content } = form;
    const payload = { title: author, category: "__site_settings__", summary: JSON.stringify(content), image_url: null, live_url: null, github_url: null, sort_order: -999, published: true };
    const { error } = id
      ? await supabase.from("projects").update(payload).eq("id", id)
      : await supabase.from("projects").insert(payload);
    setBusy(false);
    if (error) { setMessage(error.message); return; }
    setMessage("Page text updated.");
    router.refresh();
    window.setTimeout(() => setOpen(false), 500);
  }

  async function logout() {
    await createClient().auth.signOut();
    router.replace("/");
    router.refresh();
  }

  const input = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";
  return (
    <>
      <div className="pointer-events-auto fixed left-1/2 top-4 z-[2000] flex -translate-x-1/2 items-center gap-2 rounded-full border border-primary/30 bg-background/95 p-2 shadow-2xl backdrop-blur">
        <span className="hidden pl-3 text-xs font-semibold uppercase tracking-widest text-primary sm:block">Admin mode</span>
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"><Pencil className="size-4"/> Edit page text</button>
        <Link href="/admin" className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm"><Settings className="size-4"/> Dashboard</Link>
        <button onClick={logout} aria-label="Sign out" className="rounded-full border border-border p-2"><LogOut className="size-4"/></button>
      </div>
      {open && (
        <div className="pointer-events-auto fixed inset-0 z-[3000] grid place-items-center bg-black/70 p-4" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}>
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-border bg-background p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between"><div><p className="text-xs uppercase tracking-widest text-primary">Inline editor</p><h2 className="font-display text-2xl">Homepage text</h2></div><button onClick={() => setOpen(false)}><X/></button></div>
            <div className="grid gap-4 sm:grid-cols-2">
              {([
                ["author","Your name"], ["heroIntro","Hero introduction"], ["heroSubtitle","Hero subtitle"], ["skillsTitle","Skills heading"], ["experienceTitle","Learning heading"], ["experienceDescription","Learning description"], ["projectsTitle","Projects heading"], ["contactTitle","Contact heading"],
              ] as const).map(([key,label]) => <label key={key} className={key === "heroSubtitle" || key === "experienceDescription" ? "sm:col-span-2 text-sm" : "text-sm"}>{label}<input className={`${input} mt-1`} value={form[key] ?? ""} onChange={event => setForm({...form,[key]:event.target.value})}/></label>)}
              {([ ["educationLabel","Education label"], ["educationTitle","Course title"], ["educationInstitution","College / university"], ["educationPeriod","Study period"], ["certificationsTitle","Certifications heading"], ["topicsTitle","Topics heading"] ] as const).map(([key,label]) => <label key={key} className={key === "educationTitle" || key === "educationInstitution" ? "sm:col-span-2 text-sm" : "text-sm"}>{label}<input className={`${input} mt-1`} value={form[key]} onChange={event => setForm({...form,[key]:event.target.value})}/></label>)}
            </div>
            {([ ["certifications","Certifications & training"], ["topics","Topics studied"] ] as const).map(([key,label]) => <div key={key} className="mt-5 rounded-xl border border-border p-4"><div className="mb-3 flex items-center justify-between"><h3 className="font-semibold">{label}</h3><button onClick={() => setForm({...form,[key]:[...form[key],""]})} className="flex items-center gap-1 rounded-full border border-primary/40 px-3 py-1.5 text-xs text-primary"><Plus className="size-3.5"/> Add item</button></div><div className="space-y-2">{form[key].map((item,index) => <div key={`${key}-${index}`} className="flex gap-2"><input className={input} value={item} onChange={event => setForm({...form,[key]:form[key].map((current,currentIndex) => currentIndex === index ? event.target.value : current)})}/><button onClick={() => setForm({...form,[key]:form[key].filter((_,currentIndex) => currentIndex !== index)})} className="rounded-lg border border-red-500/40 px-3 text-red-400" aria-label={`Delete ${label} item`}><Trash2 className="size-4"/></button></div>)}</div></div>)}
            {message && <p className="mt-4 text-sm text-primary">{message}</p>}
            <button disabled={busy} onClick={save} className="mt-5 w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground disabled:opacity-50">{busy ? "Saving…" : "Save changes"}</button>
          </div>
        </div>
      )}
    </>
  );
}
