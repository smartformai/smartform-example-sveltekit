import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const payload: Record<string, FormDataEntryValue> = {};
    data.forEach((v, k) => { payload[k] = v; });

    const endpoint = process.env.SMARTFORM_ENDPOINT || 'https://api.usesmartform.com';
    const formId   = process.env.SMARTFORM_FORM_ID;
    if (!formId) return { ok: false, status: 500, body: { message: 'SMARTFORM_FORM_ID not set' } };

    const r = await fetch(`${endpoint}/api/v1/f/${formId}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body:    JSON.stringify(payload),
    });

    return { ok: r.ok, status: r.status, body: await r.json() };
  },
};
