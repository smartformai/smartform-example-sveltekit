# SvelteKit contact form — Formspree alternative with AI spam filtering

Contact form for SvelteKit, posting JSON to SmartForm AI from a form action.

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
## Related examples
[Next.js contact form](https://github.com/yanghuai123456/smartform-example-nextjs) | [Nuxt contact form](https://github.com/yanghuai123456/smartform-example-nuxt) | [Astro contact form](https://github.com/yanghuai123456/smartform-example-astro)


## FAQ

### Why use this instead of Formspree?

Both SmartForm and Formspree let you POST a plain HTML form to a hosted
endpoint with no backend. SmartForm adds an AI spam filter (not just
honeypots), AI intent classification (`sales` / `support` / `inquiry`)
and high-value lead detection, with a free tier that includes the spam
filter. Formspree charges per submission; SmartForm's spam filter is
free on every plan.

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

