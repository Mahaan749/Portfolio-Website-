import { config } from "@/data/config";
import { getIsAdmin } from "@/lib/cms/admin";
import { defaultNewsletterSettings, getPageSettings } from "@/lib/cms/queries";
import NewsletterClient from "./newsletter-client";

export const metadata = {
  title: `Newsletter | ${config.author}`,
  description: "Cybersecurity study notes and lab updates.",
};

export const dynamic = "force-dynamic";

export default async function NewsletterPage() {
  const [settings, isAdmin] = await Promise.all([getPageSettings("__news_settings__", defaultNewsletterSettings), getIsAdmin()]);
  return <NewsletterClient settings={settings} isAdmin={isAdmin} />;
}
