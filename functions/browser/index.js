// Cloudflare Worker: locked reverse proxy for browser.lol
// Deploy with: npx wrangler deploy   (or paste into the Workers dashboard)

const UPSTREAM = 'https://browser.lol';
const ALLOWED_PARENTS = ['https://a7mbz.github.io', 'https://a7mbz.github.io/tk', 'https://a7mbz.github.io/tk/browser/' ];

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const target = new URL(url.pathname + url.search, UPSTREAM);

    // Only serve requests coming from your dashboard (or from the framed app itself)
    const origin = request.headers.get('Origin');
    const referer = request.headers.get('Referer') || '';
    const allowed =
      (origin && ALLOWED_PARENTS.includes(origin)) ||
      ALLOWED_PARENTS.some(p => referer.startsWith(p)) ||
      referer.startsWith(url.origin) ||
      request.headers.get('Sec-Fetch-Dest') === 'iframe';
    if (!allowed) return new Response('Forbidden', { status: 403 });

    const headers = new Headers(request.headers);
    headers.set('Origin', UPSTREAM);
    headers.set('Referer', UPSTREAM + '/');

    const upstreamReq = new Request(target, {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method) ? null : request.body,
      redirect: 'manual',
    });

    const res = await fetch(upstreamReq);
    if (res.status === 101) return res; // WebSocket upgrade passes through

    const out = new Headers(res.headers);
    out.delete('x-frame-options');
    out.set('content-security-policy', `frame-ancestors ${ALLOWED_PARENTS.join(' ')}`);

    // Keep redirects inside the proxy
    const loc = out.get('location');
    if (loc) out.set('location', loc.replace(UPSTREAM, url.origin));

    // Rewrite cookies so they belong to the proxy domain
    const cookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
    if (cookies.length) {
      out.delete('set-cookie');
      for (const c of cookies) {
        out.append(
          'set-cookie',
          c.replace(/;\s*Domain=[^;]+/i, '').replace(/;\s*SameSite=\w+/i, '') + '; SameSite=None; Secure'
        );
      }
    }

    // Rewrite absolute URLs in HTML responses
    if ((out.get('content-type') || '').includes('text/html')) {
      const html = (await res.text()).replaceAll(UPSTREAM, url.origin);
      out.delete('content-length');
      return new Response(html, { status: res.status, headers: out });
    }

    return new Response(res.body, { status: res.status, headers: out });
  },
};
