import { useState, useMemo } from 'react';
import { searchHelp, suggestions, KBItem } from '../../lib/helpSearch';

export function useFAQ() {
  const [open, setOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<{ q: string; a: string } | null>(null);

  const suggs = useMemo(() => suggestions(), []);

  const ask = (q: string) => {
    const hits = searchHelp(q, 3);
    const answer =
      hits.length > 0
        ? hits.map((h) => `• ${h.title}: ${h.content}`).join('\n\n')
        : 'No encontré algo exacto. Probá con otras palabras o preguntame de otra forma 🙂';
    setSelectedTopic({ q, a: answer });
  };

  const clearTopic = () => {
    setSelectedTopic(null);
  };

  return {
    open,
    setOpen,
    selectedTopic,
    suggs,
    ask,
    clearTopic,
  };
}
