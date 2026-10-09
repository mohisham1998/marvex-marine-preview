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
  return next();
}
