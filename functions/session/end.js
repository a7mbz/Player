// Cloudflare Pages Function — POST /session/end
// Called via navigator.sendBeacon when the visitor leaves the page, so the
// session doesn't sit open against the account's concurrent-session limit.
// Same-origin only; no CORS handling needed.

const json = (body, status) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

export async function onRequestPost({ request, env }) {
  if (!env.HYPERBEAM_KEY) return json({ error: "HYPERBEAM_KEY secret is not set" }, 500);

  let sessionId = "";
  try {
    const body = await request.json();
    sessionId = (body && body.session_id) || "";
  } catch {}
  if (!sessionId) return json({ error: "session_id required" }, 400);

  try {
    await fetch(`https://engine.hyperbeam.com/v0/vm/${encodeURIComponent(sessionId)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${env.HYPERBEAM_KEY}` },
    });
  } catch {
    // Best-effort — the session will still expire on Hyperbeam's own timeout.
  }

  return json({ ok: true }, 200);
}
