import { DraftBoard } from '@/features/draft/components/DraftBoard';
import { SummonerSearch } from '@/features/summoner/SummonerSearch';

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Protofessor</h1>
      </header>
      <main className="app-main">
        <DraftBoard />
        <SummonerSearch />
      </main>
    </div>
  );
}
