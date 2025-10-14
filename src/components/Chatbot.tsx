import { useMemo, useRef, useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { searchHelp, suggestions } from '../lib/helpSearch';

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<{ q: string; a: string }[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  const suggs = useMemo(() => suggestions(), []);

  const ask = (q: string) => {
    const hits = searchHelp(q, 3);
    const answer =
      hits.length > 0
        ? hits.map((h) => `• ${h.title}: ${h.content}`).join('\n\n')
        : 'No encontré algo exacto. Probá con otras palabras o preguntame de otra forma 🙂';
    setHistory((prev) => [...prev, { q, a: answer }]);
    setInput('');
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 rounded-full p-4 bg-slate-900 text-white shadow-lg hover:bg-slate-800"
        aria-label="Abrir ayuda"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          {/* Panel: bottom sheet en mobile, panel lateral en md+ */}
          <div className="absolute left-0 right-0 bottom-0 md:right-6 md:left-auto md:bottom-24 w-full md:max-w-md bg-white rounded-t-2xl md:rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden max-h-[85vh]">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
              <div className="font-semibold text-slate-900">Ayuda</div>
              <button onClick={() => setOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 100px)' }}>
              <div className="text-sm text-slate-600">
                Probá con:
                <div className="mt-2 flex flex-wrap gap-2">
                  {suggs.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => ask(s.title)}
                      className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 rounded-full"
                    >
                      {s.title}
                    </button>
                  ))}
                </div>
              </div>

              {history.map((h, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="text-sm text-slate-900 font-medium">Tú: {h.q}</div>
                  <div className="text-sm whitespace-pre-line">{h.a}</div>
                </div>
              ))}
              <div ref={endRef} />
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (input.trim()) ask(input.trim());
              }}
              className="p-3 border-t border-slate-200 flex items-center gap-2 bg-white pb-[calc(env(safe-area-inset-bottom,0)+0.25rem)]"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
                placeholder="Escribí tu pregunta..."
              />
              <button type="submit" className="px-3 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
