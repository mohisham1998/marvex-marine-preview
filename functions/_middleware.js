// Serve the site only on the main domain: redirect pages.dev and www hosts to it.
const CANONICAL_HOST = "marvex-marine.com";

export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  if (url.hostname !== CANONICAL_HOST && (url.hostname.endsWith(".pages.dev") || url.hostname === "www." + CANONICAL_HOST)) {
    url.hostname = CANONICAL_HOST;
    url.protocol = "https:";
    url.port = "";
    return Response.redirect(url.toString(), 301);
  }
  // Generator sources live in the repo but are not part of the site.
  if (url.pathname.startsWith("/_src")) return new Response("Not found", { status: 404 });
  // Retired flag images (flags are now inline SVG from the country-flag-icons React components).
  // Answer here so stale edge-cached copies are never served.
  if (url.pathname.startsWith("/assets/flags/")) return new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });
  return next();
}
