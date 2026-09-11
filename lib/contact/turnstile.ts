// Server-side check of a Cloudflare Turnstile token (11 Sep 2026). The
// secret never reaches a browser: it is TURNSTILE_SECRET_KEY in the
// Worker's secrets (wrangler secret put TURNSTILE_SECRET_KEY) and in
// .env.local for local work, where Cloudflare's documented test pair
// always passes.
const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(token: string, secret: string, remoteIp?: string): Promise<boolean> {
  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);
  try {
    const res = await fetch(VERIFY_URL, { method: "POST", body });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
