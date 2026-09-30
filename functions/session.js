// Cloudflare Pages Function — POST /session
// Starts a Hyperbeam cloud-browser session and returns its embed URL.
// Setup: Pages project > Settings > Environment variables > add HYPERBEAM_KEY
// (type Secret) with your Hyperbeam key, then redeploy.

const ALLOWED_ORIGINS = [
  'https://a7mbz.github.io',
  'https://tk-66s.pages.dev',
];

const json = (body, status, headers) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });

function corsFor(origin) {
  return ALLOWED_ORIGINS.includes(origin)
    ? {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Vary': 'Origin',
      }
    : {};
}

export async function onRequestOptions({ request }) {
  const origin = request.headers.get('Origin') || '';
  const allowed = ALLOWED_ORIGINS.includes(origin);
  return new Response(null, { status: allowed ? 204 : 403, headers: corsFor(origin) });
}

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get('Origin') || '';
  const cors = corsFor(origin);
  if (!ALLOWED_ORIGINS.includes(origin)) return json({ error: 'Origin not allowed' }, 403, cors);

  if (!env.HYPERBEAM_KEY) {
    return json({ error: 'HYPERBEAM_KEY secret is not set on the Pages project' }, 500, cors);
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

  if (res.status === 429) {
    // Surface Hyperbeam's own reason when it sends one, plus any Retry-After hint.
    const retryAfter = res.headers.get('Retry-After');
    const reason = data.error || data.message || 'Too many requests / concurrent-session limit reached';
    return json(
      { error: `Rate limited by Hyperbeam: ${reason}${retryAfter ? ` (retry after ${retryAfter}s)` : ''}` },
      429,
      cors
    );
  }
  if (!res.ok || !data.embed_url || !data.session_id) {
    return json({ error: data.error || `Hyperbeam returned ${res.status}` }, 502, cors);
  }

  // Return embed_url (to display) and session_id (so the client can ask us to
  // end this specific session later). Never return admin_token or the API key.
  return json({ embed_url: data.embed_url, session_id: data.session_id }, 200, cors);
}
