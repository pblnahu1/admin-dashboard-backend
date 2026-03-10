import { X, ChevronLeft } from 'lucide-react';
import { useEffect } from 'react';

interface Suggestion {
  id: string;
  title: string;
  content: string;
}

interface FAQPanelProps {
  onClose: () => void;
  suggs: Suggestion[];
  selectedTopic: { q: string; a: string } | null;
  onAsk: (q: string) => void;
  onClearTopic: () => void;
}

export function FAQPanel({
  onClose,
  suggs,
  selectedTopic,
  onAsk,
  onClearTopic,
}: FAQPanelProps) {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedTopic) {
          onClearTopic();
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, selectedTopic, onClearTopic]);

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      {/* Panel: bottom sheet en mobile, panel lateral en md+ */}
      <div className="absolute left-0 right-0 bottom-0 md:right-6 md:left-auto md:bottom-24 w-full md:max-w-md bg-white rounded-t-2xl md:rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden max-h-[85vh]">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
          <div className="flex items-center gap-2">
            {selectedTopic && (
              <button
                onClick={onClearTopic}
                className="p-1 -ml-1 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Volver a los temas"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
            )}
            <div className="font-semibold text-slate-900">
              {selectedTopic ? 'Respuesta' : 'Ayuda frecuente'}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 60px)' }}>
          {selectedTopic ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
              <h3 className="text-lg font-semibold text-slate-900">{selectedTopic.q}</h3>
              <div className="text-slate-700 whitespace-pre-line leading-relaxed">
                {selectedTopic.a.replace(/• /g, '') /* Limpiamos el viñetado temporalmente para que quede como texto plano */}
              </div>
              <button
                onClick={onClearTopic}
                className="mt-6 w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
              >
                Ver otras preguntas
              </button>
            </div>
          ) : (
            <div className="space-y-2 animate-in fade-in slide-in-from-left-4 duration-200">
              <p className="text-sm text-slate-600 mb-4">
                Seleccioná un tema para obtener más información:
              </p>
              {suggs.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onAsk(s.title)}
                  className="w-full px-4 py-3 text-sm text-left font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-200 rounded-xl transition-all"
                >
                  {s.title}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
