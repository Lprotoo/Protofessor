import { create } from 'zustand';
import type { Team } from '@/core/domain';

export type DraftSide = (string | null)[]; // 5 ids de champions, null = slot vide
export type SlotRef = { team: Team; index: number } | null;

interface DraftState {
  blue: DraftSide;
  red: DraftSide;
  /** Slot en cours de sélection. */
  selected: SlotRef;
  /** Sélectionne un slot pour y placer le prochain champion. */
  select: (team: Team, index: number) => void;
  /** Place un champion dans le slot sélectionné, puis avance au prochain slot vide. */
  pick: (championId: string) => void;
  /** Vide un slot. */
  clearSlot: (team: Team, index: number) => void;
  /** Réinitialise toute la draft et sélectionne le premier slot bleu. */
  reset: () => void;
}

const emptySide = (): DraftSide => Array<string | null>(5).fill(null);

function nextEmptySlot(state: Pick<DraftState, 'blue' | 'red'>, from: SlotRef): SlotRef {
  const order: Array<[Team, DraftSide]> = [
    ['blue', state.blue],
    ['red', state.red],
  ];
  for (const [team, side] of order) {
    const startIndex = team === from?.team && from ? from.index : 0;
    for (let i = startIndex; i < 5; i++) {
      if (side[i] === null) return { team, index: i };
    }
  }
  return null;
}

export const useDraftStore = create<DraftState>((set) => ({
  blue: emptySide(),
  red: emptySide(),
  selected: { team: 'blue', index: 0 },
  select: (team, index) =>
    set((state) => ({
      selected: { team, index },
      [team]: state[team].map((c, i) => (i === index ? null : c)),
    })),
  pick: (championId) =>
    set((state) => {
      if (!state.selected) return state;
      const { team, index } = state.selected;
      const side = state[team].map((c, i) => (i === index ? championId : c));
      return {
        [team]: side,
        selected: nextEmptySlot({ blue: state.blue, red: state.red }, state.selected),
      } as Partial<DraftState>;
    }),
  clearSlot: (team, index) =>
    set((state) => ({
      [team]: state[team].map((c, i) => (i === index ? null : c)),
    })),
  reset: () => set({ blue: emptySide(), red: emptySide(), selected: { team: 'blue', index: 0 } }),
}));
