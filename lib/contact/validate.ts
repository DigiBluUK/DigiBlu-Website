// The contact form's payload, checked on the server before anything is
// done with it (11 Sep 2026). Relative imports and no Next types on
// purpose: node:test loads this file directly (scripts/contact.test.cjs).
export type Enquiry = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  message: string;
};

export type Validation = { ok: true; enquiry: Enquiry } | { ok: false; error: string };

const LIMITS = { firstName: 100, lastName: 100, email: 254, phone: 40, company: 200, message: 4000 } as const;
// Also refuses ? # & % and quote/bracket characters (21 Sep 2026): valid in
// an address only in forms nobody uses, and ? # & would start or split
// fields in the reply link's mailto.
const EMAIL = /^[^\s@?#&%<>"'()\[\]\\,;:]+@[^\s@?#&%<>"'()\[\]\\,;:]+\.[^\s@?#&%<>"'()\[\]\\,;:]+$/;

// Control characters (line breaks among them) become a single space in
// single-line fields, which go into the email's subject and table; the
// message keeps its line breaks and tabs and drops the rest. A code-point
// check rather than a regex, so no control character or escape has to
// appear in this file.
function isControl(c: number): boolean {
  return c < 32 || c === 127 || c === 0x2028 || c === 0x2029;
}
function stripControls(s: string, multiline: boolean): string {
  let out = "";
  let lastWasSpace = false;
  for (const ch of s) {
    const c = ch.codePointAt(0) as number;
    if (!isControl(c)) { out += ch; lastWasSpace = false; continue; }
    if (multiline && (c === 9 || c === 10 || c === 13)) { out += ch; continue; }
    if (!multiline && !lastWasSpace) { out += " "; lastWasSpace = true; }
  }
  return out;
}

// A trimmed string within its limit; "" for an absent optional field; null
// when the value is not a string or is too long.
function text(v: unknown, max: number, multiline = false): string | null {
  if (v === undefined || v === null) return "";
  if (typeof v !== "string") return null;
  const t = stripControls(v, multiline).trim();
  return t.length > max ? null : t;
}

export function validateEnquiry(input: unknown): Validation {
  if (!input || typeof input !== "object") return { ok: false, error: "Please fill in the form." };
  const o = input as Record<string, unknown>;
  // Honeypot: a field no person sees; anything in it is a script.
  if (typeof o.website === "string" && o.website.trim() !== "") return { ok: false, error: "Please fill in the form." };
  if (o.consent !== true) return { ok: false, error: "Please agree to the Privacy and Cookies Policy." };
  const firstName = text(o.firstName, LIMITS.firstName);
  const lastName = text(o.lastName, LIMITS.lastName);
  const email = text(o.email, LIMITS.email);
  const phone = text(o.phone, LIMITS.phone);
  const company = text(o.company, LIMITS.company);
  const message = text(o.message, LIMITS.message, true);
  if (firstName === null || lastName === null || email === null || phone === null || company === null || message === null) {
    return { ok: false, error: "One of the fields is too long." };
  }
  if (!firstName || !lastName) return { ok: false, error: "Please tell us your name." };
  if (!email || !EMAIL.test(email)) return { ok: false, error: "Please enter a valid email address." };
  return { ok: true, enquiry: { firstName, lastName, email, phone, company, message } };
}
