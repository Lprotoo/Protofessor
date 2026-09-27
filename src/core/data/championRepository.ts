import type { Champion, ChampionData } from '../domain';
import rawData from '@/data/champions.json';

export const championData = rawData as ChampionData;

/**
 * Point d'accès unique aux données champions.
 * Aujourd'hui : bundle local généré depuis Data Dragon (npm run fetch:champions).
 * Demain : pourra déléguer à l'API Riot ou à un cache sans changer les appelants.
 */
const championsById = new Map(championData.champions.map((c) => [c.id, c]));
/** Lookup par clé numérique Riot (championId renvoyé par l'API). */
const championsByKey = new Map(championData.champions.map((c) => [c.key, c]));

export function listChampions(): Champion[] {
  return championData.champions;
}

export function getChampion(id: string): Champion | undefined {
  return championsById.get(id);
}

export function getChampionByKey(key: string | number): Champion | undefined {
  return championsByKey.get(String(key));
}

export function searchChampions(query: string): Champion[] {
  const q = query.trim().toLowerCase();
  if (!q) return listChampions();
  return listChampions().filter(
    (c) => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q),
  );
}
