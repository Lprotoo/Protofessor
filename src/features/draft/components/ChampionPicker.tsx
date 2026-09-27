import { useState } from 'react';
import { useDraftStore } from '../draftStore';
import { searchChampions } from '@/core/data/championRepository';
import { championSquareUrl } from '@/core/data/ddragon';
import type { Team } from '@/core/domain';

const PICKER_LIMIT = 60;

function teamLabel(team: Team): string {
  return team === 'blue' ? 'Alliés' : 'Ennemis';
}

export function ChampionPicker() {
  const [query, setQuery] = useState('');
  const pick = useDraftStore((s) => s.pick);
  const selected = useDraftStore((s) => s.selected);

  const results = searchChampions(query).slice(0, PICKER_LIMIT);
  const disabled = !selected;

  return (
    <section className="picker">
      <header className="picker-header">
        {selected ? (
          <h2>
            Sélection pour{' '}
            <span className={`picker-team picker-team--${selected.team}`}>
              {teamLabel(selected.team)} #{selected.index + 1}
            </span>
          </h2>
        ) : (
          <h2>Draft complète</h2>
        )}
        <input
          className="picker-search"
          type="search"
          placeholder="Rechercher un champion…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </header>

      {disabled && (
        <p className="picker-hint">Clique sur un slot de la draft pour choisir un champion.</p>
      )}

      <ul className="picker-grid" role="listbox" aria-label="Liste des champions">
        {results.map((champion) => (
          <li key={champion.id}>
            <button
              type="button"
              className="picker-champion"
              onClick={() => pick(champion.id)}
              disabled={disabled}
              title={`${champion.name} — ${champion.roles.join(', ')}`}
            >
              <img
                src={championSquareUrl(champion.id)}
                alt=""
                loading="lazy"
                width={48}
                height={48}
              />
              <span>{champion.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
