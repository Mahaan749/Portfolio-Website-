import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { config } from "@/data/config";

export const metadata = {
  title: `Newsletter | ${config.author}`,
  description: "Cybersecurity study notes and lab updates.",
};

export default function NewsletterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-20">
      <section className="w-full max-w-xl rounded-3xl border border-primary/25 bg-card/80 px-7 py-12 text-center shadow-[0_30px_100px_-55px_rgba(40,211,157,.55)] backdrop-blur-xl md:px-14 md:py-16">
        <p className="mb-5 font-mono text-xs uppercase tracking-[.3em] text-primary">
          Newsletter
        </p>
        <h1 className="text-4xl font-bold leading-tight md:text-5xl">
          Field notes, minus the noise.
        </h1>
        <p className="mx-auto mt-6 max-w-md text-muted-foreground">
          Short updates about cybersecurity labs, defensive techniques and what I am learning. The mailing list is being prepared.
        </p>
        <a
          href={`mailto:${config.email}?subject=Cybersecurity field notes`}
          className="mx-auto mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
        >
          <Mail className="size-4" /> Ask me for updates
        </a>
        <Link href="/" className="mx-auto mt-8 flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to portfolio
        </Link>
      </section>
    </main>
  );
}
