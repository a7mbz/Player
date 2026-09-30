// Cloudflare Pages Function — POST /session/end
// Terminates a Hyperbeam session by ID, called via navigator.sendBeacon when
// the visitor leaves the page, so it doesn't sit open against the account's
// concurrent-session limit.

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
  // sendBeacon can't set custom headers, so Origin may be absent on some
  // browsers; fall back to Referer's origin in that case.
  const origin =
    request.headers.get('Origin') ||
    (() => { try { return new URL(request.headers.get('Referer') || '').origin; } catch { return ''; } })();
  const cors = corsFor(origin);
  if (!ALLOWED_ORIGINS.includes(origin)) return json({ error: 'Origin not allowed' }, 403, cors);
  if (!env.HYPERBEAM_KEY) return json({ error: 'HYPERBEAM_KEY secret is not set' }, 500, cors);

  let sessionId = '';
  try {
    const body = await request.json();
    sessionId = (body && body.session_id) || '';
  } catch {}
  if (!sessionId) return json({ error: 'session_id required' }, 400, cors);

  try {
    await fetch(`https://engine.hyperbeam.com/v0/vm/${encodeURIComponent(sessionId)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${env.HYPERBEAM_KEY}` },
    });
  } catch {
    // Best-effort: the session will still expire on Hyperbeam's own timeout.
  }

  return json({ ok: true }, 200, cors);
}
