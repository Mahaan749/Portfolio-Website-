import { EmailTemplate } from "@/components/email-template";
import { config } from "@/data/config";
import { Resend } from "resend";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

const Email = z.object({
  fullName: z.string().min(2, "Full name is invalid!"),
  email: z.string().email({ message: "Email is invalid!" }),
  message: z.string().min(10, "Message is too short!"),
});
export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    if (isRateLimited(ip)) {
      return Response.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await req.json();
    const {
      success: zodSuccess,
      data: zodData,
      error: zodError,
    } = Email.safeParse(body);
    if (!zodSuccess)
      return Response.json({ error: zodError?.message }, { status: 400 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl || !supabaseKey) return Response.json({ error: "Contact inbox is not configured." }, { status: 503 });
    const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
    // Do not request the inserted row back here. Visitors may insert messages,
    // but only an authenticated portfolio admin may read them.
    const { error: submissionError } = await supabase.from("contact_submissions").insert({
      full_name: zodData.fullName,
      email: zodData.email,
      message: zodData.message,
    });
    if (submissionError) return Response.json({ error: "Unable to save your message. Please try again shortly." }, { status: 500 });

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "Portfolio <onboarding@resend.dev>", to: [config.email], subject: "Contact me from portfolio",
        react: EmailTemplate({ fullName: zodData.fullName, email: zodData.email, message: zodData.message }) as React.ReactElement,
      });
    }
    return Response.json({ saved: true });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
