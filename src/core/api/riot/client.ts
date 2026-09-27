import { riotFetch } from './httpClient';
import { platformHost, regionalHost } from './regions';
import type { RegionCode, RiotMatchDetail, RiotMatchPreview, RiotSummoner } from './types';

/**
 * Interface de l'adaptateur Riot. Toutes les features passent par ce
 * contrat : si l'implémentation change (mock pour tests, autre source),
 * les composants restent intacts.
 */
export interface RiotApiClient {
  getSummonerByName(region: RegionCode, name: string): Promise<RiotSummoner>;
  getMatchHistory(region: RegionCode, puuid: string, count: number): Promise<RiotMatchPreview[]>;
}

/**
 * Implémentation réelle : passe par le proxy du serveur de dev
 * (/riot-proxy), qui injecte la clé API et gère les rate limits.
 * Le pacing exact des requêtes est fait côté proxy, donc les appels
 * peuvent être lancés en parallèle sans dépasser le quota.
 */
export function createHttpRiotApi(): RiotApiClient {
  // Cache mémoire des matchs déjà récupérés : 1 requête économisée
  // pour chaque rerun d'une même session (économie de quota).
  const matchCache = new Map<string, RiotMatchDetail>();

  return {
    async getSummonerByName(region: RegionCode, name: string): Promise<RiotSummoner> {
      const encoded = encodeURIComponent(name);
      return riotFetch<RiotSummoner>(
        platformHost(region),
        `/lol/summoner/v4/summoners/by-name/${encoded}`,
      );
    },

    async getMatchHistory(
      region: RegionCode,
      puuid: string,
      count: number,
    ): Promise<RiotMatchPreview[]> {
      const host = regionalHost(region);
      const matchIds = await riotFetch<string[]>(
        host,
        `/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}`,
      );

      const details = await Promise.all(
        matchIds.map(async (matchId) => {
          const cached = matchCache.get(matchId);
          if (cached) return cached;
          const detail = await riotFetch<RiotMatchDetail>(host, `/lol/match/v5/matches/${matchId}`);
          matchCache.set(matchId, detail);
          return detail;
        }),
      );

      return details.map((detail) => {
        const participant = detail.info.participants.find((p) => p.puuid === puuid);
        if (!participant) {
          throw new Error(
            `Participant ${puuid} introuvable dans le match ${detail.metadata.matchId}`,
          );
        }
        return {
          matchId: detail.metadata.matchId,
          region,
          gameCreation: detail.info.gameCreation,
          durationSeconds: detail.info.gameDuration,
          championId: participant.championId,
          championName: participant.championName,
          win: participant.win,
          kills: participant.kills,
          deaths: participant.deaths,
          assists: participant.assists,
        } satisfies RiotMatchPreview;
      });
    },
  };
}

let client: RiotApiClient = createHttpRiotApi();

export function setRiotApiClient(next: RiotApiClient): void {
  client = next;
}

export function riotApi(): RiotApiClient {
  return client;
}
