import type { Enquiry } from "./validate.ts";

// The one function to replace (11 Sep 2026). The route handler
// (app/api/contact/route.ts) calls it only after the payload has been
// validated and the Turnstile token verified, so by the time an enquiry
// arrives here it is a complete one from a person.
//
// DigiBlu's developer wires the downstream call in here: send the enquiry
// by email through Azure Communication Services, or whatever the chosen
// channel is. Configuration belongs in the Worker's environment (vars for
// addresses, secrets for keys, read from process.env), never in this
// file. Throwing makes the route answer 500 and the form show its error
// line, so throw on failure rather than swallowing it.
//
// Until then this records that an enquiry arrived and nothing else: no
// personal data goes to the logs.
export async function sendEnquiry(enquiry: Enquiry): Promise<void> {
  console.log("[contact] enquiry received", { at: new Date().toISOString(), hasMessage: enquiry.message.length > 0 });
}
