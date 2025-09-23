export const fetchWithTimeout = async (url: string, timeoutMs = 10000, init?: RequestInit): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...(init || {}), signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
};

export default fetchWithTimeout;

