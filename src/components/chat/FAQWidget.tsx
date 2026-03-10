import { useFAQ } from './useFAQ';
import { FAQButton } from './FAQButton';
import { FAQPanel } from './FAQPanel';

export function FAQWidget() {
  const {
    open,
    setOpen,
    selectedTopic,
    suggs,
    ask,
    clearTopic,
  } = useFAQ();

  return (
    <>
      <FAQButton onClick={() => setOpen(true)} />

      {open && (
        <FAQPanel
          onClose={() => setOpen(false)}
          suggs={suggs}
          selectedTopic={selectedTopic}
          onAsk={ask}
          onClearTopic={clearTopic}
        />
      )}
    </>
  );
}
