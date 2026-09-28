# SmartForm + SvelteKit

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

## License

MIT.
