/**
 * Wrapper para fetch com timeout e tratamento de erro robusto
 */
export async function robustFetch(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 3000
): Promise<Response | null> {
  // Verificar se o fetch está disponível
  if (typeof fetch === 'undefined') {
    return null;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    // Silently handle all fetch errors to prevent console spam
    // This includes network errors, timeouts, and aborts
    return null;
  }
}

/**
 * Wrapper para POST requests com JSON
 */
export async function robustPost(
  url: string,
  data: any,
  timeoutMs: number = 3000
): Promise<{ success: boolean; data?: any }> {
  const response = await robustFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }, timeoutMs);

  if (!response || !response.ok) {
    return { success: false };
  }

  try {
    const result = await response.json();
    return { success: true, data: result };
  } catch {
    return { success: false };
  }
}
