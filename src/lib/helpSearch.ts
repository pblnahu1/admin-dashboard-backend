import kb from '../help/kb.json';

export type KBItem = {
  id: string;
  title: string;
  content: string;
};

export function searchHelp(query: string, limit = 5): KBItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const scored = (kb as KBItem[]).map((item) => {
    const t = item.title.toLowerCase();
    const c = item.content.toLowerCase();
    let score = 0;
    if (t.includes(q)) score += 2;
    if (c.includes(q)) score += 1;
    return { item, score };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.item);
}

export function suggestions(): KBItem[] {
  return (kb as KBItem[]).slice(0, 4);
}
