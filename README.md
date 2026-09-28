# SvelteKit contact form — Formspree alternative with AI spam filtering

Contact form for SvelteKit, posting JSON to SmartForm AI from a form action.

## What you're POSTing

The endpoint accepts a standard HTML form POST or JSON via AJAX. Two
kinds of fields:

**Your form fields** — `name`, `email`, `message`, whatever you
want. Every non-reserved field lands in your dashboard as a column in
the submissions table.

**Reserved fields** — names starting with `_` are interpreted by
the API, not stored:

| Field | Purpose |
|---|---|
| ``_gotcha`` | **Honeypot.** Keep it empty. Hidden from humans via CSS; bots fill it automatically. Any non-empty value silently drops the submission. Add this to every form. |
| ``_hp_email`` / ``_website`` / ``_url`` / ``_phone`` | Honeypot aliases for `_gotcha` (WordPress / WPForms / Contact Form 7 migrations). Same drop semantics. |
| ``_next`` | Same-origin URL to redirect to after a successful submission. Browser POST results in a 302 here. AJAX calls (with `Accept: application/json`) get the same value back as `next_url` in the JSON response. Only http(s) and in-site paths allowed. |
| ``_subject`` | Override the AI-generated email subject line. Max 200 chars; control characters stripped. |
| `X-Gotcha` header | Same as `_gotcha` for JSON requests where you can't add a hidden form field. |

Field names are Formspree-compatible — migrating from
`formspree.io/f/{form_id}` requires no renaming.

## Setup

1. Get a form ID at https://usesmartform.com/dashboard.
2. Clone, install, configure, run:
   ```bash
   git clone https://github.com/yanghuai123456/smartform-example-sveltekit.git
   cd smartform-example-sveltekit
   npm install
   cp .env.example .env
   # edit .env → SMARTFORM_FORM_ID=f_your_real_id
   npm run dev
   ```
3. Open http://localhost:5173/contact, submit, check your dashboard.

## The form action

`src/routes/contact/+page.server.ts` handles the POST and forwards to SmartForm. The
page itself (`+page.svelte`) is a normal HTML form.

```ts
// src/routes/contact/+page.server.ts
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const payload: Record<string, FormDataEntryValue> = {};
    data.forEach((v, k) => { payload[k] = v; });

    const r = await fetch(`${process.env.SMARTFORM_ENDPOINT ?? 'https://api.usesmartform.com'}/api/v1/f/${process.env.SMARTFORM_FORM_ID}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body:    JSON.stringify(payload),
    });

    return { ok: r.ok, status: r.status, body: await r.json() };
  },
};
```

`src/routes/contact/+page.svelte` renders the form and reads `form` from props to show status.

## How the API works

- `POST {endpoint}/api/v1/f/{form_id}` — JSON or form-data, no API key.
- Response: `{ success, message, submission_id, is_spam, intent, next_url }`.

For the full contract, see https://usesmartform.com/docs.

## Deploy

```bash
npm run build         # ./build
npx vercel --prod     # or `wrangler pages deploy ./build`
```

Set `SMARTFORM_FORM_ID` in your hosting provider's environment variables.


## FAQ

### Why use this instead of Formspree?

At the basic level, SmartForm and Formspree are very similar: get a
form ID, POST a plain HTML form to a hosted endpoint with `_gotcha`
for spam filtering, and the API delivers the submission. The reserved
fields (`_gotcha`, `_next`, `_subject`, honeypot aliases) are
Formspree-compatible — a migration does not require renaming
anything.

The differences are operational, not API surface:

- **No email confirmation flow.** Formspree requires verifying your
  domain before submissions reach your inbox; SmartForm submissions
  land in your dashboard immediately.
- **AI spam filtering on the free tier.** Formspree's free tier uses
  only a honeypot field, which catches naive bots but lets semantic
  spam through. SmartForm applies AI-based classification by default,
  free of charge.
- **AI intent classification** (`sales` / `support` / `inquiry`
  / `spam`) on the Pro tier, for routing submissions without writing
  rules yourself.
- **No per-submission metering** on the basic plan.

### Is there a free tier?

Yes. AI spam filtering is enabled by default on every plan. AI intent
classification and high-value lead detection require a paid plan (Pro
or Business) — the dashboard enforces this and returns HTTP 402 if
you try to enable them on a free workspace.

### Do I need an API key?

No. The form posts directly to a public endpoint using only an 8-char
form ID, which is non-enumerable. The example also includes a hidden
`_gotcha` honeypot field so naive bots cannot submit.

### Do I need a SvelteKit server?
The example uses a SvelteKit form action so the form ID stays server-side. It runs on Vercel, Netlify, Cloudflare and Node adapters without code changes.

## Related examples
[Next.js contact form](https://github.com/yanghuai123456/smartform-example-nextjs) | [Nuxt contact form](https://github.com/yanghuai123456/smartform-example-nuxt) | [Astro contact form](https://github.com/yanghuai123456/smartform-example-astro)


## License

MIT.

