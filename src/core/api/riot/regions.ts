// Codes de région Riot et leurs hôtes API.
// Documentation : https://developer.riotgames.com/docs/lol#routing-values
// - platform routing : summoner-v4, spectator-v4... (ex: euw1)
// - regional routing : match-v5, account-v1... (ex: europe)

export type RegionCode =
  | 'euw'
  | 'eune'
  | 'na'
  | 'kr'
  | 'jp'
  | 'br'
  | 'lan'
  | 'las'
  | 'oce'
  | 'tr'
  | 'ru';

const PLATFORM_HOST: Record<RegionCode, string> = {
  euw: 'euw1',
  eune: 'eun1',
  na: 'na1',
  kr: 'kr',
  jp: 'jp1',
  br: 'br1',
  lan: 'la1',
  las: 'la2',
  oce: 'oc1',
  tr: 'tr1',
  ru: 'ru',
};

const REGIONAL_HOST: Record<RegionCode, string> = {
  euw: 'europe',
  eune: 'europe',
  tr: 'europe',
  ru: 'europe',
  na: 'americas',
  br: 'americas',
  lan: 'americas',
  las: 'americas',
  oce: 'americas',
  kr: 'asia',
  jp: 'asia',
};

export function platformHost(region: RegionCode): string {
  return PLATFORM_HOST[region];
}

export function regionalHost(region: RegionCode): string {
  return REGIONAL_HOST[region];
}

export const REGIONS: RegionCode[] = Object.keys(PLATFORM_HOST) as RegionCode[];
