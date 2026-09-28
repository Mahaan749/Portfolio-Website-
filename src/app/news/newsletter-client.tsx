"use client";

import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { config } from "@/data/config";
import type { PageSettings } from "@/lib/cms/types";
import PageContentToolbar from "@/components/admin/page-content-toolbar";

export default function NewsletterClient({ settings, isAdmin }: { settings: PageSettings; isAdmin: boolean }) {
  return <main className="min-h-screen px-5 py-24">
    {isAdmin && <PageContentToolbar settings={settings} category="__news_settings__" pageName="Newsletter page" />}
    <section className="mx-auto w-full max-w-xl rounded-3xl border border-primary/25 bg-card/80 px-7 py-12 text-center shadow-[0_30px_100px_-55px_rgba(40,211,157,.55)] backdrop-blur-xl md:px-14 md:py-16">
      <p className="mb-5 font-mono text-xs uppercase tracking-[.3em] text-primary">{settings.eyebrow}</p>
      <h1 className="text-4xl font-bold leading-tight md:text-5xl">{settings.title}</h1>
      <p className="mx-auto mt-6 max-w-md text-muted-foreground">{settings.description}</p>
      <a href={`mailto:${config.email}?subject=Cybersecurity field notes`} className="mx-auto mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"><Mail className="size-4"/> {settings.ctaLabel}</a>
      <Link href="/" className="mx-auto mt-8 flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4"/> Back to portfolio</Link>
    </section>
    {settings.sections.length > 0 && <div className="mx-auto mt-8 grid w-full max-w-4xl gap-5 md:grid-cols-2">{settings.sections.map(section => <section key={section.id} className="rounded-2xl border border-primary/20 bg-card/70 p-7 backdrop-blur"><h2 className="mb-3 text-2xl font-bold">{section.title}</h2><p className="whitespace-pre-line leading-relaxed text-muted-foreground">{section.body}</p></section>)}</div>}
  </main>;
}
