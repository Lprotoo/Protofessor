import { championData } from './championRepository';

/**
 * Construction des URLs d'images Data Dragon.
 * Centralisé ici pour pouvoir plus tard basculer sur des images locales
 * (assets téléchargés) sans toucher aux composants.
 */

const CDN_BASE = 'https://ddragon.leagueoflegends.com/cdn';

export const currentPatch = championData.patch;

/** Portrait carré du champion. */
export function championSquareUrl(championId: string): string {
  return `${CDN_BASE}/${currentPatch}/img/champion/${championId}.png`;
}

/** Art de chargement (splash) du champion. */
export function championSplashUrl(championId: string): string {
  return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championId}_0.jpg`;
}

/** Icône de profil d'un invocateur. */
export function profileIconUrl(profileIconId: number): string {
  return `${CDN_BASE}/${currentPatch}/img/profileicon/${profileIconId}.png`;
}
