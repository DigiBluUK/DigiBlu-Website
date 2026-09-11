// Explicit .ts extensions (allowImportingTsExtensions in tsconfig) so Node's
// own module loader, which node:test uses, resolves them; the bundler does too.
import { validateEnquiry } from "../../../lib/contact/validate.ts";
import { verifyTurnstile } from "../../../lib/contact/turnstile.ts";
import { sendEnquiry } from "../../../lib/contact/send.ts";

// The contact form's endpoint (11 Sep 2026): the only dynamic route on the
// site, run by the Cloudflare Worker. Same-origin JSON in, JSON out;
// validates, verifies the Turnstile token with the secret from the
// environment, then hands the enquiry to sendEnquiry() (lib/contact/send.ts),
// which is the developer's to fill. Web-standard Request/Response only, and
// relative imports, so scripts/contact.test.cjs can call POST directly.
//
// Payload: { firstName, lastName, email, phone?, company?, message?,
//            consent: true, website: "" (honeypot), turnstileToken }
// Answers: 200 { ok: true } | 400/403/500 { ok: false, error }
const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

export async function POST(req: Request): Promise<Response> {
  let input: unknown;
  try {
    input = await req.json();
  } catch {
    return json(400, { ok: false, error: "Please fill in the form." });
  }
  const v = validateEnquiry(input);
  if (!v.ok) return json(400, { ok: false, error: v.error });

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error("[contact] TURNSTILE_SECRET_KEY is not set; refusing to accept enquiries unverified");
    return json(500, { ok: false, error: "The form is not available right now. Please email us instead." });
  }
  const raw = (input as Record<string, unknown>).turnstileToken;
  const token = typeof raw === "string" ? raw : "";
  const ip = req.headers.get("cf-connecting-ip") || undefined;
  if (!token || !(await verifyTurnstile(token, secret, ip))) {
    return json(403, { ok: false, error: "The security check did not pass. Please try again." });
  }

  try {
    await sendEnquiry(v.enquiry);
  } catch (e) {
    console.error("[contact] sendEnquiry failed", e);
    return json(500, { ok: false, error: "We could not send your request. Please try again or email us." });
  }
  return json(200, { ok: true });
}
