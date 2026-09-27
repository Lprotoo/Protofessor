import { useDraftStore } from '../draftStore';
import { DraftSlot } from './DraftSlot';
import { ChampionPicker } from './ChampionPicker';
import type { Team } from '@/core/domain';

function TeamColumn({ team }: { team: Team }) {
  return (
    <div className={`draft-column draft-column--${team}`}>
      <h2 className="draft-column-title">{team === 'blue' ? 'Alliés' : 'Ennemis'}</h2>
      <div className="draft-slots">
        {Array.from({ length: 5 }, (_, index) => (
          <DraftSlot key={index} team={team} index={index} />
        ))}
      </div>
    </div>
  );
}

export function DraftBoard() {
  const reset = useDraftStore((s) => s.reset);

  return (
    <div className="draft">
      <div className="draft-board">
        <TeamColumn team="blue" />
        <TeamColumn team="red" />
      </div>
      <ChampionPicker />
      <button type="button" className="draft-reset" onClick={reset}>
        Réinitialiser la draft
      </button>
    </div>
  );
}
