const DEFAULT_API_URL = "http://localhost:3001";

export class SipesApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "SipesApiError";
  }
}

function getApiUrl() {
  return (process.env.SIPES_API_URL ?? DEFAULT_API_URL).replace(/\/$/, "");
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${getApiUrl()}${path}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    let message = `El backend respondió con estado ${response.status}`;

    try {
      const body = (await response.json()) as { message?: string | string[] };
      if (Array.isArray(body.message)) message = body.message.join(". ");
      else if (body.message) message = body.message;
    } catch {
      // El cuerpo puede no ser JSON. Conservamos un mensaje útil con el estado.
    }

    throw new SipesApiError(message, response.status);
  }

  return response.json() as Promise<T>;
}
