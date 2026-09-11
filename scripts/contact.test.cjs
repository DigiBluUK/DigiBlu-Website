const test = require("node:test");
const assert = require("node:assert/strict");

// The contact API (11 Sep 2026): the validator and the route handler,
// with Cloudflare's verify endpoint mocked. Node 24 strips types, so the
// TypeScript modules load directly; they use relative imports and
// web-standard Request/Response only for this reason.
const load = (p) => import(p);
const good = { firstName: "Jane", lastName: "Smith", email: "jane@example.com", phone: "07123 456789", company: "Acme", message: "Hello", consent: true, website: "", turnstileToken: "tok" };

test("validateEnquiry: accepts a complete enquiry and trims it", async () => {
  const { validateEnquiry } = await load("../lib/contact/validate.ts");
  const r = validateEnquiry({ ...good, firstName: "  Jane " });
  assert.equal(r.ok, true);
  assert.equal(r.enquiry.firstName, "Jane");
  assert.equal(r.enquiry.phone, "07123 456789");
  const minimal = validateEnquiry({ firstName: "A", lastName: "B", email: "a@b.co", consent: true });
  assert.equal(minimal.ok, true);
  assert.equal(minimal.enquiry.message, "");
});

test("validateEnquiry: rejects missing names, bad email, no consent, a filled honeypot, oversize text", async () => {
  const { validateEnquiry } = await load("../lib/contact/validate.ts");
  for (const bad of [
    { ...good, firstName: "" }, { ...good, lastName: " " }, { ...good, email: "nope" }, { ...good, consent: false },
    { ...good, website: "http://spam" }, { ...good, message: "x".repeat(4001) }, { ...good, phone: 12345 }, "not an object", null,
  ]) assert.equal(validateEnquiry(bad).ok, false, JSON.stringify(bad).slice(0, 40));
});

test("POST /api/contact: 200 with a verified token, 403 without, 400 on bad input, 500 with no secret", async () => {
  const { POST } = await load("../app/api/contact/route.ts");
  const req = (body) => new Request("http://localhost/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: typeof body === "string" ? body : JSON.stringify(body) });
  const realFetch = globalThis.fetch;
  const realLog = console.log;
  const realError = console.error;
  console.log = () => {};
  console.error = () => {};
  globalThis.fetch = async (url, init) => {
    assert.match(String(url), /challenges\.cloudflare\.com\/turnstile\/v0\/siteverify$/);
    const params = new URLSearchParams(init.body);
    assert.equal(params.get("secret"), "secret");
    return new Response(JSON.stringify({ success: params.get("response") === "tok" }), { headers: { "content-type": "application/json" } });
  };
  try {
    process.env.TURNSTILE_SECRET_KEY = "secret";
    const ok = await POST(req(good));
    assert.equal(ok.status, 200);
    assert.deepEqual(await ok.json(), { ok: true });
    assert.equal((await POST(req({ ...good, turnstileToken: "wrong" }))).status, 403);
    assert.equal((await POST(req({ ...good, turnstileToken: "" }))).status, 403);
    const bad = await POST(req({ ...good, email: "bad" }));
    assert.equal(bad.status, 400);
    assert.equal((await bad.json()).error, "Please enter a valid email address.");
    assert.equal((await POST(req("{not json"))).status, 400);
    delete process.env.TURNSTILE_SECRET_KEY;
    assert.equal((await POST(req(good))).status, 500);
  } finally {
    globalThis.fetch = realFetch;
    console.log = realLog;
    console.error = realError;
  }
});
