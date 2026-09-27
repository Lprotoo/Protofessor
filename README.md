# Protofessor

Application locale de suivi de draft et de stats League of Legends, inspirée d'op.gg / Porofessor. Fonctionne entièrement en local dans le navigateur.

## Stack

- [Vite](https://vite.dev) + [React](https://react.dev) 18 + TypeScript strict
- [Zustand](https://zustand.docs.pmnd.rs) pour le state management
- Architecture en features (`src/features/*`) + couche data (`src/core/*`)

## Fonctionnalités

- **Draft** : 10 slots (5 alliés / 5 ennemis), sélection des champions par nom avec portraits Data Dragon
- **Recherche d'invocateur** : icône, niveau et 5 derniers matchs (champion, K/D/A, résultat)

## Installation

```bash
npm install
npm run dev
```

Ouvre http://localhost:5173.

### Clé API Riot (optionnel, pour la recherche d'invocateur)

La clé API ne doit jamais être commitée. Le serveur de dev Vite fait office de proxy (`server/riotProxy.ts`) : il lit la clé dans `.env` et l'injecte côté serveur, avec un rate limiter intégré (20 req/s + 100 req/2 min).

```bash
cp .env.example .env
# puis renseigne RIOT_API_KEY dans .env
```

Relance `npm run dev` après modification du `.env` (lu au démarrage).

Attention : sur le portail Riot, chaque application/clé est mono-jeu. Il faut une clé avec le produit **League of Legends** (Personal API Key recommandée : permanente, mêmes rate limits que la clé de dev).

## Scripts

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de dev (avec proxy Riot) |
| `npm run build` | Build production (`tsc -b` + Vite) |
| `npm run preview` | Prévisualise le build |
| `npm run fetch:champions` | Régénère `src/data/champions.json` au dernier patch via Data Dragon |

## Architecture

```
src/
├── core/                  # couche transverse, indépendante de l'UI
│   ├── domain.ts          # types métier (Team, Champion...)
│   ├── data/              # données champions + URLs d'images Data Dragon
│   └── api/riot/          # client Riot API (interface + implémentation HTTP)
└── features/              # une feature = un dossier autonome
    ├── draft/             # draft + sélecteur de champions
    └── summoner/          # recherche d'invocateur
server/
└── riotProxy.ts           # proxy dev-server + rate limiter (clé dans .env)
scripts/
└── fetch-champions.mjs    # génération des données champions
```

Pour ajouter une fonctionnalité : nouveau dossier dans `src/features/`, éventuellement un store Zustand dédié, et passer par les interfaces de `src/core` pour toute donnée externe.
