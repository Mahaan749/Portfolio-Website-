"use client";

import { Award } from "lucide-react";
import type { CmsProject } from "@/lib/cms/types";
import SectionWrapper from "@/components/ui/section-wrapper";
import { SectionHeader } from "./section-header";
import InlineCertificateEditor from "@/components/admin/inline-certificate-editor";

export default function CertificatesSection({ certificates, title, isAdmin }: { certificates: CmsProject[]; title: string; isAdmin: boolean }) {
  if (!isAdmin && certificates.length === 0) return null;
  return <SectionWrapper id="certifications" className="mx-auto min-h-screen max-w-7xl px-4 py-24">
    <div className="relative">
      <SectionHeader id="certifications" title={title} desc="Credentials, courses and milestones from my cybersecurity journey." className="static mb-12"/>
      {isAdmin && <div className="pointer-events-auto absolute right-0 top-0 z-40"><InlineCertificateEditor/></div>}
    </div>
    {certificates.length > 0 ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{certificates.map(certificate => <article key={certificate.id} className="group relative overflow-hidden rounded-2xl border border-primary/20 bg-card/75 backdrop-blur-md">
      {isAdmin && <div className="pointer-events-auto absolute right-3 top-3 z-20"><InlineCertificateEditor certificate={certificate}/></div>}
      <button type="button" onClick={() => certificate.image_url && window.open(certificate.image_url, "_blank", "noopener,noreferrer")} className="block w-full cursor-zoom-in bg-black/20 text-left" aria-label={`Open ${certificate.title} certificate image`}>
        <div className="aspect-[4/3] overflow-hidden">{certificate.image_url && <img src={certificate.image_url} alt={`${certificate.title} certificate`} className="h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-[1.03]"/>}</div>
      </button>
      <div className="border-t border-primary/15 p-5"><div className="mb-3 flex items-center gap-2 text-primary"><Award className="size-4"/><span className="font-mono text-[10px] uppercase tracking-[.2em]">Certificate</span></div><h3 className="font-display text-xl leading-tight">{certificate.title}</h3>{certificate.summary && <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{certificate.summary}</p>}</div>
    </article>)}</div> : <div className="rounded-2xl border border-dashed border-primary/30 bg-card/40 p-12 text-center text-muted-foreground"><Award className="mx-auto mb-4 size-8 text-primary"/><p>No certificate images added yet.</p><p className="mt-1 text-sm">Use “Add certificate” to upload the first one.</p></div>}
  </SectionWrapper>;
}
