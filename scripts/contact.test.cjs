const test = require("node:test");
const assert = require("node:assert/strict");

// The contact API (11 Sep 2026): the validator and the route handler, with
// Cloudflare's verify endpoint mocked. Node 24 strips types, so the
// TypeScript modules load directly; they use relative imports and
// web-standard Request/Response only for this reason. The ACS send is
// mocked at the HTTP layer too: the tests run with --conditions=browser,
// where the Azure SDK uses the fetch-based client, so one globalThis.fetch
// mock stands in for both Turnstile and ACS. The route responds as soon
// as ACS accepts the message and tracks delivery in the background
// (fire-and-forget here: node:test has no Workers request context), so the
// route test waits for the background poll's log before restoring fetch.
const load = (p) => import(p);
// The browser build of the Azure SDK reaches Web Crypto via `self`, which
// Workers and browsers define and plain Node does not.
globalThis.self ??= globalThis;
const good = { firstName: "Jane", lastName: "Smith", email: "jane@example.com", phone: "07123 456789", company: "Acme", message: "Hello", consent: true, website: "", turnstileToken: "tok" };

const ACS_ENDPOINT = "https://test-res.azurecomm.net";
const ACS_CONNECTION_STRING = `endpoint=${ACS_ENDPOINT};accesskey=${Buffer.from("test-access-key").toString("base64")}`;
const SENDER = "DoNotReply@test-res.azurecomm.net";
const RECIPIENT = "inbox@digiblu.com";

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

// 21 Sep 2026: single-line fields lose control characters (they go into the
// subject), the message keeps its line breaks, and an address with ? # & %
// is refused (they would split the reply link's mailto).
test("validateEnquiry: control characters and mailto-breaking addresses", async () => {
  const { validateEnquiry } = await load("../lib/contact/validate.ts");
  const r = validateEnquiry({ ...good, firstName: "Jane\r\nBcc: x", company: "Acme\tLtd", message: "One\nTwo" + String.fromCharCode(7) });
  assert.equal(r.ok, true);
  assert.equal(r.enquiry.firstName, "Jane Bcc: x");
  assert.equal(r.enquiry.company, "Acme Ltd");
  assert.equal(r.enquiry.message, "One\nTwo");
  for (const email of ["x?bcc=a@b.co@c.co", "x@b.co?bcc=a@b.co", "a#b@c.co", "a&b@c.co", "a%40@b.co"]) {
    assert.equal(validateEnquiry({ ...good, email }).ok, false, email);
  }
  assert.equal(validateEnquiry({ ...good, email: "first.last+tag@sub.example.co.uk" }).ok, true);
});

test("loggableError: no access key and no address reaches the logs", async () => {
  const { loggableError } = await load("../lib/contact/send.ts");
  const e = new Error(`Invalid connection string ${ACS_CONNECTION_STRING}`);
  const out = JSON.stringify(loggableError(e));
  assert.ok(!out.includes(Buffer.from("test-access-key").toString("base64")), "access key redacted");
  assert.match(out, /accesskey=\[redacted\]/);
  const v = loggableError(Object.assign(new Error("Invalid replyTo address jane@example.com"), { code: "InvalidRequest", statusCode: 400 }));
  assert.equal(v.code, "InvalidRequest");
  assert.equal(v.statusCode, 400);
  assert.ok(!JSON.stringify(v).includes("jane@example.com"), "address redacted");
  assert.equal(typeof loggableError("plain string").message, "string");
});

test("buildEnquiryEmail: subject, addresses, reply-to, escaped content", async () => {
  const { buildEnquiryEmail } = await load("../lib/contact/send.ts");
  const m = buildEnquiryEmail(
    { firstName: "Jane", lastName: "Smith", email: "jane@example.com", phone: "", company: "<Acme & Co>", message: "Line one\nLine two" },
    SENDER,
    RECIPIENT
  );
  assert.equal(m.content.subject, "New contact form submission: Jane Smith");
  assert.equal(m.senderAddress, SENDER);
  assert.deepEqual(m.recipients.to, [{ address: RECIPIENT }]);
  assert.deepEqual(m.replyTo, [{ address: "jane@example.com" }]);
  assert.match(m.content.plainText, /Phone: -/);
  assert.match(m.content.plainText, /Company: <Acme & Co>/);
  assert.ok(!m.content.html.includes("<Acme"), "html must escape user input");
  assert.match(m.content.html, /&lt;Acme &amp; Co&gt;/);
  assert.match(m.content.html, /Line one<br>Line two/);
  // The reply link's address is URL-encoded, so nothing in it can add a field.
  const plus = buildEnquiryEmail({ firstName: "A", lastName: "B", email: "a+b@example.com", phone: "", company: "", message: "" }, SENDER, RECIPIENT);
  assert.match(plus.content.html, /href="mailto:a%2Bb%40example\.com"/);
});

test("POST /api/contact: 200 with a verified token, 403 without, 400 on bad input, 500 when the submit fails", async () => {
  const { POST } = await load("../app/api/contact/route.ts");
  const req = (body) => new Request("http://localhost/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: typeof body === "string" ? body : JSON.stringify(body) });
  const realFetch = globalThis.fetch;
  const realLog = console.log;
  const realError = console.error;
  const logs = [];
  const errors = [];
  console.log = (...args) => logs.push(args);
  console.error = (...args) => errors.push(args);
  const sentEmails = [];
  let operationPolls = 0;
  let acsRejectsSubmit = false;
  let acsFailsFirstPoll = false;
  globalThis.fetch = async (url, init) => {
    const u = String(url);
    if (/challenges\.cloudflare\.com\/turnstile\/v0\/siteverify$/.test(u)) {
      const params = new URLSearchParams(init.body);
      assert.equal(params.get("secret"), "secret");
      return new Response(JSON.stringify({ success: params.get("response") === "tok" }), { headers: { "content-type": "application/json" } });
    }
    if (u.startsWith(`${ACS_ENDPOINT}/emails:send`)) {
      if (acsRejectsSubmit) return new Response(JSON.stringify({ error: { code: "Unauthorized" } }), { status: 401, headers: { "content-type": "application/json" } });
      sentEmails.push(JSON.parse(init.body));
      return new Response(null, { status: 202, headers: { "operation-location": `${ACS_ENDPOINT}/emails/operations/op-1?api-version=2023-03-31` } });
    }
    if (u.startsWith(`${ACS_ENDPOINT}/emails/operations/`)) {
      operationPolls++;
      return new Response(JSON.stringify({ id: "msg-1", status: acsFailsFirstPoll ? "Failed" : "Succeeded" }), { headers: { "content-type": "application/json" } });
    }
    throw new Error(`unexpected fetch: ${u}`);
  };
  const deliveryLogged = () => logs.some((a) => a[0] === "[contact] enquiry emailed" && a[1] && a[1].id === "msg-1");
  try {
    process.env.TURNSTILE_SECRET_KEY = "secret";
    process.env.AZURE_COMMUNICATION_SERVICES_CONNECTION_STRING = ACS_CONNECTION_STRING;
    process.env.CONTACT_FORM_SENDER_EMAIL_ADDRESS = SENDER;
    process.env.CONTACT_FORM_RECIPIENT_EMAIL_ADDRESS = RECIPIENT;
    const ok = await POST(req(good));
    assert.equal(ok.status, 200);
    assert.deepEqual(await ok.json(), { ok: true });
    assert.equal(sentEmails.length, 1, "exactly one email is submitted on success");
    assert.equal(sentEmails[0].senderAddress, SENDER);
    assert.equal(sentEmails[0].content.subject, "New contact form submission: Jane Smith");
    assert.deepEqual(sentEmails[0].recipients.to, [{ address: RECIPIENT }]);
    assert.deepEqual(sentEmails[0].replyTo, [{ address: "jane@example.com" }]);
    assert.match(sentEmails[0].content.plainText, /Hello/);
    // The response has already gone out; delivery is polled in the
    // background. Wait (bounded) for that poll and its success log.
    const deadline = Date.now() + 2000;
    while (!deliveryLogged() && Date.now() < deadline) await new Promise((r) => setTimeout(r, 5));
    assert.ok(deliveryLogged(), "the background poll logs the delivery with the ACS message id only");
    assert.equal(operationPolls, 1, "the background poll checks the operation once");
    assert.equal((await POST(req({ ...good, turnstileToken: "wrong" }))).status, 403);
    assert.equal((await POST(req({ ...good, turnstileToken: "" }))).status, 403);
    const bad = await POST(req({ ...good, email: "bad" }));
    assert.equal(bad.status, 400);
    assert.equal((await bad.json()).error, "Please enter a valid email address.");
    assert.equal((await POST(req("{not json"))).status, 400);
    // A body far past any real enquiry is refused before it is parsed.
    assert.equal((await POST(req({ ...good, message: "x".repeat(40 * 1024) }))).status, 413);
    assert.equal(sentEmails.length, 1, "nothing is sent for rejected submissions");
    delete process.env.AZURE_COMMUNICATION_SERVICES_CONNECTION_STRING;
    const unconfigured = await POST(req(good));
    assert.equal(unconfigured.status, 500);
    assert.equal((await unconfigured.json()).error, "We could not send your request. Please try again or email us.");
    process.env.AZURE_COMMUNICATION_SERVICES_CONNECTION_STRING = ACS_CONNECTION_STRING;
    delete process.env.TURNSTILE_SECRET_KEY;
    assert.equal((await POST(req(good))).status, 500);
    process.env.TURNSTILE_SECRET_KEY = "secret";
    // A rejected initial send (auth, bad sender) still answers 500 before
    // the response goes out; nothing is polled for it. The SDK's beginSend
    // also does one status poll, so an immediately failed delivery - ACS
    // accepted the message but reports it Failed at once - answers 500
    // too; only failures that appear on a later poll are background logs.
    acsRejectsSubmit = true;
    assert.equal((await POST(req(good))).status, 500);
    acsRejectsSubmit = false;
    acsFailsFirstPoll = true;
    assert.equal((await POST(req(good))).status, 500);
    acsFailsFirstPoll = false;
    assert.equal(sentEmails.length, 2, "the auth failure submits nothing, the at-once failure submits one");
    assert.equal(operationPolls, 2, "each accepted submission is polled once during submit");
    assert.equal(errors.filter((a) => a[0] === "[contact] submitEnquiry failed").length, 3, "every submit-time failure is logged (unconfigured, auth, at-once failure)");
    // What was logged carries no access key and no address from the enquiry.
    const logged = JSON.stringify(errors);
    assert.ok(!logged.includes(Buffer.from("test-access-key").toString("base64")), "no access key in the logs");
    assert.ok(!logged.includes("jane@example.com"), "no visitor address in the logs");
  } finally {
    // Let any not-yet-settled background poll finish before the fetch mock
    // goes away, so it cannot hit the real network.
    await new Promise((r) => setTimeout(r, 25));
    globalThis.fetch = realFetch;
    console.log = realLog;
    console.error = realError;
    delete process.env.TURNSTILE_SECRET_KEY;
    delete process.env.AZURE_COMMUNICATION_SERVICES_CONNECTION_STRING;
    delete process.env.CONTACT_FORM_SENDER_EMAIL_ADDRESS;
    delete process.env.CONTACT_FORM_RECIPIENT_EMAIL_ADDRESS;
  }
});

test("trackDelivery: every outcome is logged, never thrown", async () => {
  const { trackDelivery } = await load("../lib/contact/send.ts");
  const realLog = console.log;
  const realError = console.error;
  const logs = [];
  const errors = [];
  console.log = (...args) => logs.push(args);
  console.error = (...args) => errors.push(args);
  try {
    // A later poll reports a terminal failure: logged with the status and
    // id, and resolved, not rejected - the response has already gone out.
    await trackDelivery({ pollUntilDone: async () => ({ id: "msg-2", status: "Failed" }) });
    assert.equal(logs.length, 0, "a failed delivery does not log success");
    assert.ok(errors.some((a) => a[0] === "[contact] ACS email delivery did not succeed" && a[1] && a[1].id === "msg-2" && a[1].status === "Failed"), "a failed delivery is logged with the ACS status");
    errors.length = 0;
    // The SDK throws when the operation has failed; trackDelivery logs the
    // error rather than rejecting.
    await trackDelivery({ pollUntilDone: async () => { throw new Error("The long-running operation has failed"); } });
    assert.equal(logs.length, 0);
    assert.ok(errors.some((a) => a[0] === "[contact] ACS email delivery failed"), "a poll error is logged");
    errors.length = 0;
    // Success: the log carries the ACS message id only, no personal data.
    await trackDelivery({ pollUntilDone: async () => ({ id: "msg-3", status: "Succeeded" }) });
    assert.equal(errors.length, 0);
    assert.ok(logs.some((a) => a[0] === "[contact] enquiry emailed" && a[1] && a[1].id === "msg-3"), "success is logged with the ACS message id");
  } finally {
    console.log = realLog;
    console.error = realError;
  }
});
