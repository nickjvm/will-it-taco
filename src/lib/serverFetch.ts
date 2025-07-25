const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://willittaco.com/api"
    : "http://localhost:3000/api");
export default async function serverFetch<T>(
  _url: string,
  ops?: RequestInit
): Promise<T> {
  const url = _url.startsWith("/") ? `${API_URL}${_url}` : _url;
  return fetch(url, ops).then((r) => r.json() as Promise<T>);
}
