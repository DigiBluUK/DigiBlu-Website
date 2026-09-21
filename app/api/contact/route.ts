// Explicit .ts extensions (allowImportingTsExtensions in tsconfig) so Node's
// own module loader, which node:test uses, resolves them; the bundler does too.
import { validateEnquiry } from "../../../lib/contact/validate.ts";
import { verifyTurnstile } from "../../../lib/contact/turnstile.ts";
import { loggableError, submitEnquiry, trackDelivery } from "../../../lib/contact/send.ts";
import { getRequestExecutionContext } from "vinext/shims/request-context";

// The contact form's endpoint (11 Sep 2026): the only dynamic route on the
// site, run by the Cloudflare Worker. Same-origin JSON in, JSON out;
// validates, verifies the Turnstile token with the secret from the
// environment, then hands the enquiry to submitEnquiry() (lib/contact/send.ts),
// which awaits ACS accepting the message - the SDK's beginSend also checks
// the operation status once, so an immediately rejected send still answers
// 500 - and returns the operation's poller. The delivery outcome is tracked
// afterwards: trackDelivery() polls the operation and logs success or
// failure, scheduled through the Workers request context
// (getRequestExecutionContext().waitUntil keeps the poll running past the
// response; on Node dev the context is null and the poll runs on, never
// rejecting). Web-standard Request/Response only, and relative imports, so
// scripts/contact.test.cjs can call POST directly.
//
// Payload: { firstName, lastName, email, phone?, company?, message?,
//            consent: true, website: "" (honeypot), turnstileToken }
// Answers: 200 { ok: true } | 400/403/413/500 { ok: false, error }
const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

// A full enquiry at every field's limit is under 20KB even in 4-byte
// characters; anything bigger is not the form.
const MAX_BODY = 32 * 1024;
const TOO_LARGE = "Your message is too long. Please shorten it or email us.";

export async function POST(req: Request): Promise<Response> {
  if (Number(req.headers.get("content-length") || 0) > MAX_BODY) return json(413, { ok: false, error: TOO_LARGE });
  let input: unknown;
  try {
    const body = await req.text();
    if (body.length > MAX_BODY) return json(413, { ok: false, error: TOO_LARGE });
    input = JSON.parse(body);
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
    const poller = await submitEnquiry(v.enquiry);
    // Started unconditionally: optional chaining would short-circuit the
    // call itself on Node, where there is no context. On the Worker,
    // waitUntil keeps the isolate alive until the poll finishes; on Node
    // the poll simply runs on. trackDelivery never rejects, so there is
    // no unhandled rejection either way.
    const delivery = trackDelivery(poller);
    getRequestExecutionContext()?.waitUntil(delivery);
  } catch (e) {
    // loggableError, not e: the raw error can quote the connection string.
    console.error("[contact] submitEnquiry failed", { at: new Date().toISOString(), ...loggableError(e) });
    return json(500, { ok: false, error: "We could not send your request. Please try again or email us." });
  }
  return json(200, { ok: true });
}
