// Génère src/data/champions.json depuis les données officielles Data Dragon de Riot.
// Usage : npm run fetch:champions
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const VERSIONS_URL = 'https://ddragon.leagueoflegends.com/api/versions.json';
const CHAMPIONS_URL = (version) =>
  `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`;

const OUT_DIR = path.join(process.cwd(), 'src', 'data');
const OUT_FILE = path.join(OUT_DIR, 'champions.json');

async function main() {
  const versions = await (await fetch(VERSIONS_URL)).json();
  const latest = versions[0];
  console.log(`Dernière version Data Dragon : ${latest}`);

  const raw = await (await fetch(CHAMPIONS_URL(latest))).json();

  const champions = Object.values(raw.data)
    .map((c) => ({
      id: c.id, // identifiant Data Dragon (ex: "Ahri") - clé pour les images
      key: c.key, // clé numérique Riot (ex: "103") - utilisée par l'API Riot
      name: c.name,
      title: c.title,
      roles: c.tags, // ["Mage", "Assassin"]
      difficulty: c.info.difficulty,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const payload = {
    patch: latest,
    generatedAt: new Date().toISOString(),
    champions,
  };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(payload, null, 2), 'utf-8');
  console.log(`${champions.length} champions écrits dans ${OUT_FILE}`);
}

main().catch((err) => {
  console.error('Échec de la récupération des champions :', err);
  process.exit(1);
});
