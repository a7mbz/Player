// Cloudflare Pages Function — POST /session
// Same-origin only: the browser never calls Hyperbeam directly, and this
// Function never receives cross-site requests, so no CORS handling is needed.
// Setup: Pages project > Settings > Environment variables > add HYPERBEAM_KEY
// (type Secret), then redeploy.

const json = (body, status) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

export async function onRequestPost({ request, env }) {
  if (!env.HYPERBEAM_KEY) {
    return json({ error: "HYPERBEAM_KEY secret is not set on the Pages project" }, 500);
  }

  let res;
  try {
    res = await fetch("https://engine.hyperbeam.com/v0/vm", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.HYPERBEAM_KEY}`,
        "Content-Type": "application/json",
      },
      body: "{}",
    });
  } catch {
    return json({ error: "Could not reach the session service" }, 502);
  }

  const data = await res.json().catch(() => ({}));

  if (res.status === 429) {
    const retryAfter = res.headers.get("Retry-After");
    return json(
      { error: `Too many sessions right now${retryAfter ? ` — retry in ${retryAfter}s` : ""}` },
      429
    );
  }
  if (!res.ok || !data.embed_url || !data.session_id) {
    return json({ error: data.error || data.message || "Could not start the session" }, 502);
  }

  return json({ embed_url: data.embed_url, session_id: data.session_id }, 200);
}
