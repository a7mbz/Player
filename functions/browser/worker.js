// Cloudflare Worker: starts a Hyperbeam cloud-browser session for your Toolkit page.
// The Hyperbeam API key lives here as a secret and never reaches the browser.
//
// Setup:
//   1. Create the Worker and paste this file.
//   2. Add a secret named HYPERBEAM_KEY (Settings > Variables and Secrets, or:
//      npx wrangler secret put HYPERBEAM_KEY)
//   3. Deploy, then paste the Worker address into the Browser page.

// Origins only: scheme + host, no path.
const ALLOWED_ORIGINS = ['https://a7mbz.github.io'];

const json = (body, status, headers) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = ALLOWED_ORIGINS.includes(origin);
    const cors = allowed
      ? {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Vary': 'Origin',
        }
      : {};

    if (!allowed) return json({ error: 'Origin not allowed' }, 403, cors);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    const url = new URL(request.url);
    if (url.pathname !== '/session' || request.method !== 'POST') {
      return json({ error: 'Not found' }, 404, cors);
    }
    if (!env.HYPERBEAM_KEY) {
      return json({ error: 'HYPERBEAM_KEY secret is not set on the Worker' }, 500, cors);
    }

    let res;
    try {
      res = await fetch('https://engine.hyperbeam.com/v0/vm', {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.HYPERBEAM_KEY}` },
      });
    } catch {
      return json({ error: 'Could not reach Hyperbeam' }, 502, cors);
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.embed_url) {
      return json({ error: `Hyperbeam returned ${res.status}` }, 502, cors);
    }

    // Return only the embed URL. Never expose admin_token or the API key.
    return json({ embed_url: data.embed_url }, 200, cors);
  },
};
