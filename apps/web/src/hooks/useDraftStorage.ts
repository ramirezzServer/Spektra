import { useEffect, useRef, useState } from 'react';

export function useDraftStorage(key: string | null, initialValue = '', delay = 400) {
  const [value, setValue] = useState(initialValue);
  const [restored, setRestored] = useState(false);
  const ready = useRef(false);

  useEffect(() => {
    ready.current = false;
    setRestored(false);
    if (!key) {
      setValue(initialValue);
      return;
    }

    const saved = sessionStorage.getItem(key);
    if (saved !== null) {
      setValue(saved);
      setRestored(saved !== initialValue);
    } else {
      setValue(initialValue);
    }
    ready.current = true;
  }, [initialValue, key]);

  useEffect(() => {
    if (!key || !ready.current) return;
    const timeout = window.setTimeout(() => {
      if (value) sessionStorage.setItem(key, value);
      else sessionStorage.removeItem(key);
    }, delay);

    return () => window.clearTimeout(timeout);
  }, [delay, key, value]);

  function clearDraft() {
    if (key) sessionStorage.removeItem(key);
    setRestored(false);
  }

  return { value, setValue, restored, clearDraft };
}
