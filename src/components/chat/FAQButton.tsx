import { MessageCircle } from 'lucide-react';

interface FAQButtonProps {
  onClick: () => void;
}

export function FAQButton({ onClick }: FAQButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 rounded-full p-4 bg-slate-900 text-white shadow-lg hover:bg-slate-800"
      aria-label="Abrir ayuda"
    >
      <MessageCircle className="w-6 h-6" />
    </button>
  );
}
