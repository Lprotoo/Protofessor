import { useState, type FormEvent } from 'react';
import { riotApi } from '@/core/api/riot/client';
import { RiotApiError } from '@/core/api/riot/httpClient';
import { REGIONS, type RegionCode } from '@/core/api/riot/regions';
import type { RiotMatchPreview, RiotSummoner } from '@/core/api/riot/types';
import { getChampionByKey } from '@/core/data/championRepository';
import { championSquareUrl, profileIconUrl } from '@/core/data/ddragon';

const MATCH_COUNT = 5;

interface SummonerState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  summoner: RiotSummoner | null;
  matches: RiotMatchPreview[];
  error: string | null;
}

const INITIAL_STATE: SummonerState = {
  status: 'idle',
  summoner: null,
  matches: [],
  error: null,
};

function errorMessage(err: unknown): string {
  if (err instanceof RiotApiError) {
    if (err.status === 404) return 'Invocateur introuvable sur cette région.';
    if (err.status === 403) return 'Clé API invalide ou expirée (vérifie le .env).';
    return `Erreur API Riot (${err.status}) : ${err.message}`;
  }
  return 'Erreur inattendue.';
}

export function SummonerSearch() {
  const [region, setRegion] = useState<RegionCode>('euw');
  const [name, setName] = useState('');
  const [state, setState] = useState<SummonerState>(INITIAL_STATE);

  async function search(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || state.status === 'loading') return;

    setState({ status: 'loading', summoner: null, matches: [], error: null });
    try {
      const api = riotApi();
      const summoner = await api.getSummonerByName(region, trimmed);
      const matches = await api.getMatchHistory(region, summoner.puuid, MATCH_COUNT);
      setState({ status: 'ready', summoner, matches, error: null });
    } catch (err) {
      setState({ status: 'error', summoner: null, matches: [], error: errorMessage(err) });
    }
  }

  return (
    <section className="summoner">
      <h2>Recherche d'invocateur</h2>
      <form className="summoner-form" onSubmit={search}>
        <select
          className="summoner-region"
          value={region}
          onChange={(e) => setRegion(e.target.value as RegionCode)}
        >
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {r.toUpperCase()}
            </option>
          ))}
        </select>
        <input
          className="summoner-name"
          type="text"
          placeholder="Nom d'invocateur"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" disabled={state.status === 'loading' || !name.trim()}>
          {state.status === 'loading' ? 'Recherche…' : 'Rechercher'}
        </button>
      </form>

      {state.status === 'error' && <p className="summoner-error">{state.error}</p>}

      {state.status === 'ready' && state.summoner && (
        <div className="summoner-result">
          <div className="summoner-card">
            <img src={profileIconUrl(state.summoner.profileIconId)} alt="" width={64} height={64} />
            <div>
              <div className="summoner-card-name">{state.summoner.name}</div>
              <div className="summoner-card-level">Niveau {state.summoner.summonerLevel}</div>
            </div>
          </div>

          <ul className="match-list">
            {state.matches.map((match) => {
              const champion = getChampionByKey(match.championId);
              return (
                <li key={match.matchId} className={`match match--${match.win ? 'win' : 'loss'}`}>
                  <img
                    src={championSquareUrl(champion?.id ?? 'Ahri')}
                    alt={match.championName}
                    width={40}
                    height={40}
                  />
                  <div>
                    <div className="match-champion">{match.championName}</div>
                    <div className="match-score">
                      {match.kills}/{match.deaths}/{match.assists}
                    </div>
                  </div>
                  <span className="match-result">{match.win ? 'Victoire' : 'Défaite'}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
