<script lang="ts">
  export let form: { ok: boolean; status: number; body: any } | null = null;
  $: status = form
    ? (form.ok ? `Sent! submission_id=${form.body.submission_id} intent=${form.body.intent}`
               : `Error ${form.status}: ${form.body.message}`)
    : '';
</script>

<h1>Contact</h1>
<form method="POST" style="display: grid; gap: 12px; max-width: 480px;">
  <input name="name"  placeholder="Name"  required />
  <input name="email" type="email" placeholder="Email" required />
  <textarea name="message" placeholder="Message" required style="min-height: 100px;"></textarea>
  <input type="text" name="_gotcha" tabindex="-1" autocomplete="off"
         style="position: absolute; left: -9999px;" aria-hidden="true" />
  <button type="submit" style="background: #7c3aed; color: #fff; border: 0; padding: 8px 10px;">Send</button>
  <p>{status}</p>
</form>
