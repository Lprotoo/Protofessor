// Types renvoyés par l'API Riot.
// Documentation : https://developer.riotgames.com/docs/lol

import type { RegionCode } from './regions';

export type { RegionCode };

export interface RiotSummoner {
  id: string;
  accountId: string;
  puuid: string;
  name: string;
  summonerLevel: number;
  profileIconId: number;
  revisionDate: number;
}

export interface RiotMatchPreview {
  matchId: string;
  region: RegionCode;
  /** Timestamp Unix en ms. */
  gameCreation: number;
  durationSeconds: number;
  championId: number;
  championName: string;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
}

// --- Types bruts des endpoints match-v5 ---

export interface RiotMatchParticipant {
  puuid: string;
  championId: number;
  championName: string;
  kills: number;
  deaths: number;
  assists: number;
  win: boolean;
  teamId: number;
}

export interface RiotMatchDetail {
  metadata: {
    matchId: string;
    participants: string[];
  };
  info: {
    gameCreation: number;
    gameDuration: number;
    participants: RiotMatchParticipant[];
  };
}
