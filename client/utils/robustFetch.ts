// Utility para fazer requisições HTTP robustas que funcionam mesmo com interceptadores como FullStory
export interface FetchOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  timeout?: number;
  credentials?: RequestCredentials;
}

export interface FetchResponse {
  ok: boolean;
  status: number;
  statusText: string;
  json: () => Promise<any>;
  text: () => Promise<string>;
}

// Implementação usando XMLHttpRequest como fallback
function createXHRFetch(
  url: string,
  options: FetchOptions = {},
): Promise<FetchResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const method = options.method || "GET";
    const timeout = options.timeout || 10000;

    xhr.timeout = timeout;
    xhr.open(method, url, true);

    // Set headers
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
    }

    // Handle credentials
    if (
      options.credentials === "include" ||
      options.credentials === "same-origin"
    ) {
      xhr.withCredentials = true;
    }

    xhr.onload = () => {
      const response: FetchResponse = {
        ok: xhr.status >= 200 && xhr.status < 300,
        status: xhr.status,
        statusText: xhr.statusText,
        json: async () => {
          try {
            return JSON.parse(xhr.responseText);
          } catch (e) {
            throw new Error("Invalid JSON response");
          }
        },
        text: async () => xhr.responseText,
      };
      resolve(response);
    };

    xhr.onerror = () => {
      reject(new Error(`Network error: ${xhr.status} ${xhr.statusText}`));
    };

    xhr.ontimeout = () => {
      reject(new Error(`Request timeout after ${timeout}ms`));
    };

    xhr.onabort = () => {
      reject(new Error("Request aborted"));
    };

    try {
      xhr.send(options.body);
    } catch (error) {
      reject(error);
    }
  });
}

// Função principal que tenta fetch nativo primeiro, depois XMLHttpRequest
export async function robustFetch(
  url: string,
  options: FetchOptions = {},
): Promise<FetchResponse> {
  // Primeiro, tentar fetch nativo
  try {
    console.log(`🌐 [ROBUST] Tentando fetch nativo para ${url}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      options.timeout || 10000,
    );

    const response = await fetch(url, {
      method: options.method || "GET",
      headers: options.headers,
      body: options.body,
      credentials: options.credentials || "same-origin",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log(`✅ [ROBUST] Fetch nativo bem-sucedido para ${url}`);

    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      json: () => response.json(),
      text: () => response.text(),
    };
  } catch (nativeFetchError) {
    console.warn(
      `⚠️ [ROBUST] Fetch nativo falhou para ${url}:`,
      nativeFetchError,
    );

    // Se fetch nativo falhar, usar XMLHttpRequest
    try {
      console.log(`🔄 [ROBUST] Tentando XMLHttpRequest para ${url}`);
      const response = await createXHRFetch(url, options);
      console.log(`✅ [ROBUST] XMLHttpRequest bem-sucedido para ${url}`);
      return response;
    } catch (xhrError) {
      console.error(
        `❌ [ROBUST] Ambos fetch nativo e XMLHttpRequest falharam para ${url}:`,
        xhrError,
      );
      throw new Error(
        `Falha em todas as tentativas de requisição: ${nativeFetchError.message} | ${xhrError.message}`,
      );
    }
  }
}

// Versão específica para JSON APIs
export async function robustFetchJson<T = any>(
  url: string,
  options: FetchOptions = {},
): Promise<T> {
  const defaultHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const mergedOptions: FetchOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await robustFetch(url, mergedOptions);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.json();
}
