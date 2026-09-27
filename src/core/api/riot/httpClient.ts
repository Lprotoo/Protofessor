/**
 * Erreur standardisée pour tous les appels Riot.
 * status contient le code HTTP d'origine (404 = introuvable, 403 = clé
 * invalide/expirée, 429 = rate limit, 503 = service indisponible...).
 */
export class RiotApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'RiotApiError';
  }
}

const PROXY_BASE = '/riot-proxy';

export async function riotFetch<T>(host: string, apiPath: string): Promise<T> {
  const response = await fetch(`${PROXY_BASE}/${host}${apiPath}`);

  if (!response.ok) {
    let message = response.statusText;
    try {
      const body = (await response.json()) as { status?: { message?: string } };
      message = body.status?.message ?? message;
    } catch {
      // corps non JSON : on garde le statusText
    }
    throw new RiotApiError(response.status, message);
  }

  return (await response.json()) as T;
}
