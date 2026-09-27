import type { Plugin, ViteDevServer } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';

/**
 * Proxy Riot pour le serveur de dev Vite.
 *
 * - La clé API reste côté serveur (lue dans .env) : elle n'est jamais
 *   exposée dans le bundle navigateur.
 * - Format d'appel côté navigateur :
 *     /riot-proxy/{host}/{chemin riot}
 *   ex: /riot-proxy/euw1/lol/summoner/v4/summoners/by-name/Faker
 *       /riot-proxy/europe/lol/match/v5/matches/by-puuid/{puuid}/ids
 * - Respecte les rate limits de la clé :
 *     20 requêtes / seconde, 100 requêtes / 2 minutes
 *   Les requêtes sont mises en file d'attente si la limite est atteinte,
 *   et les 429 renvoyés par Riot sont rejoués après Retry-After.
 */

const PROXY_PREFIX = '/riot-proxy';
const SHORT_LIMIT = 20;
const SHORT_WINDOW_MS = 1_000;
const LONG_LIMIT = 100;
const LONG_WINDOW_MS = 120_000;
const MAX_RETRIES = 2;

interface RiotProxyOptions {
  apiKey?: string;
}

/**
 * Rate limiter à double fenêtre glissante, sérialisé par une file
 * pour garantir que le quota n'est jamais dépassé même en rafale.
 */
class RateLimiter {
  private shortHits: number[] = [];
  private longHits: number[] = [];
  private queue: Promise<void> = Promise.resolve();

  acquire(): Promise<void> {
    this.queue = this.queue.then(() => this.waitForSlot());
    return this.queue;
  }

  private async waitForSlot(): Promise<void> {
    for (;;) {
      const now = Date.now();
      this.shortHits = this.shortHits.filter((t) => t > now - SHORT_WINDOW_MS);
      this.longHits = this.longHits.filter((t) => t > now - LONG_WINDOW_MS);

      let waitMs = 0;
      if (this.longHits.length >= LONG_LIMIT) {
        waitMs = this.longHits[0] + LONG_WINDOW_MS - now + 1;
      }
      if (this.shortHits.length >= SHORT_LIMIT) {
        waitMs = Math.max(waitMs, this.shortHits[0] + SHORT_WINDOW_MS - now + 1);
      }

      if (waitMs <= 0) {
        const slot = Date.now();
        this.shortHits.push(slot);
        this.longHits.push(slot);
        return;
      }
      await sleep(waitMs);
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sendJson(res: ServerResponse, status: number, message: string): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ status: { message } }));
}

async function handleRiotRequest(
  server: ViteDevServer,
  apiKey: string,
  limiter: RateLimiter,
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  if (req.method !== 'GET') {
    sendJson(res, 405, 'Seules les requêtes GET sont supportées par le proxy.');
    return;
  }

  // /riot-prefix retiré par Connect : req.url = /{host}/{chemin}?{query}
  const raw = req.url ?? '';
  const queryStart = raw.indexOf('?');
  const pathPart = queryStart === -1 ? raw : raw.slice(0, queryStart);
  const queryPart = queryStart === -1 ? '' : raw.slice(queryStart);
  const segments = pathPart.split('/').filter(Boolean);
  const host = segments[0];

  if (!host || !/^[a-z0-9]+$/.test(host) || segments.length < 2) {
    sendJson(res, 400, `URL attendue : ${PROXY_PREFIX}/{host}/{chemin riot}`);
    return;
  }

  const apiPath = '/' + segments.slice(1).join('/') + queryPart;
  const target = `https://${host}.api.riotgames.com${apiPath}`;

  await limiter.acquire();

  let attempt = 0;
  // Les 429 sont rejoués en respectant Retry-After ; les autres erreurs remontent telles quelles.
  for (;;) {
    const response = await fetch(target, {
      headers: { 'X-Riot-Token': apiKey, Accept: 'application/json' },
    });

    if (response.status === 429 && attempt < MAX_RETRIES) {
      attempt += 1;
      const retryAfter = Number(response.headers.get('retry-after') ?? 1);
      server.config.logger.info(`[riot-proxy] 429, nouvelle tentative dans ${retryAfter}s`);
      await sleep(retryAfter * 1000);
      await limiter.acquire();
      continue;
    }

    res.statusCode = response.status;
    res.setHeader('Content-Type', response.headers.get('content-type') ?? 'application/json');
    res.end(Buffer.from(await response.arrayBuffer()));
    return;
  }
}

export function riotProxyPlugin(options: RiotProxyOptions): Plugin {
  const limiter = new RateLimiter();

  return {
    name: 'riot-proxy',
    configureServer(server) {
      if (!options.apiKey) {
        server.config.logger.warn(
          '[riot-proxy] RIOT_API_KEY absente du .env : le proxy renverra une erreur 500.',
        );
      }

      server.middlewares.use(PROXY_PREFIX, (req, res) => {
        const apiKey = options.apiKey;
        if (!apiKey) {
          sendJson(res, 500, 'RIOT_API_KEY non configurée (voir .env.example).');
          return;
        }
        handleRiotRequest(server, apiKey, limiter, req, res).catch((err) => {
          server.config.logger.error(`[riot-proxy] ${String(err)}`);
          if (!res.headersSent) sendJson(res, 502, 'Erreur du proxy Riot.');
        });
      });
    },
  };
}
