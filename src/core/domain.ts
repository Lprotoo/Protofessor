// Types du domaine partagés par toutes les features.

export type Team = 'blue' | 'red';

export interface Champion {
  /** Identifiant Data Dragon (ex: "MonkeyKing"), clé des images. */
  id: string;
  /** Clé numérique Riot (ex: "62"), utilisée par l'API Riot. */
  key: string;
  name: string;
  title: string;
  roles: string[];
  difficulty: number;
}

export interface ChampionData {
  patch: string;
  generatedAt: string;
  champions: Champion[];
}
