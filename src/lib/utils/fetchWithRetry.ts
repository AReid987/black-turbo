export interface FetchOptions {
  retries?: number;
  backoff?: number; // ms
  timeout?: number; // ms
}

export async function fetchWithRetry(
  url: string,
  options: RequestInit & FetchOptions = {}
): Promise<Response> {
  const { retries = 3, backoff = 1000, timeout = 10000, ...fetchOptions } = options;

  const attempt = async (remaining: number): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok && remaining > 0) {
        throw new Error(`HTTP ${res.status}`);
      }
      return res;
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (remaining <= 0) throw err;

      const delay = backoff * (retries - remaining + 1);
      await new Promise((r) => setTimeout(r, delay));
      return attempt(remaining - 1);
    }
  };

  return attempt(retries);
}

// Convenience wrapper for JSON responses
export async function fetchJSON<T>(
  url: string,
  options?: RequestInit & FetchOptions
): Promise<T> {
  const res = await fetchWithRetry(url, options);
  return res.json();
}
