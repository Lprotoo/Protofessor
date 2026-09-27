import { useDraftStore } from '../draftStore';
import { getChampion } from '@/core/data/championRepository';
import { championSquareUrl } from '@/core/data/ddragon';
import type { Team } from '@/core/domain';

interface DraftSlotProps {
  team: Team;
  index: number;
}

export function DraftSlot({ team, index }: DraftSlotProps) {
  const championId = useDraftStore((s) => s[team][index]);
  const isSelected = useDraftStore(
    (s) => s.selected?.team === team && s.selected?.index === index,
  );
  const select = useDraftStore((s) => s.select);
  const clearSlot = useDraftStore((s) => s.clearSlot);

  const champion = championId ? getChampion(championId) : undefined;

  return (
    <div
      className={`draft-slot draft-slot--${team} ${isSelected ? 'draft-slot--selected' : ''}`}
      onClick={() => select(team, index)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') select(team, index);
      }}
      aria-label={champion ? champion.name : `Slot ${index + 1} vide`}
    >
      {champion ? (
        <>
          <img src={championSquareUrl(champion.id)} alt={champion.name} width={56} height={56} />
          <span className="draft-slot-name">{champion.name}</span>
          <button
            type="button"
            className="draft-slot-clear"
            aria-label={`Retirer ${champion.name}`}
            onClick={(e) => {
              e.stopPropagation();
              clearSlot(team, index);
            }}
          >
            ×
          </button>
        </>
      ) : (
        <span className="draft-slot-empty">{index + 1}</span>
      )}
    </div>
  );
}
