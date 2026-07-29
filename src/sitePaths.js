const baseUrl = import.meta.env.BASE_URL;

export function sitePath(path = "") {
  return `${baseUrl}${path.replace(/^\/+/, "")}`;
}

export function currentSitePath() {
  const basePath = new URL(baseUrl, window.location.origin).pathname.replace(/\/$/, "");
  const pathname = window.location.pathname;
  return basePath && pathname.startsWith(basePath)
    ? pathname.slice(basePath.length) || "/"
    : pathname;
}
