import { useCallback, useEffect, useMemo, useState } from 'react';

function isMacPlatform() {
  if (typeof navigator === 'undefined') return false;
  return /Mac|iPhone|iPad|iPod/i.test(navigator.platform);
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false);
  const isMac = useMemo(isMacPlatform, []);
  const shortcutLabel = isMac ? 'Cmd K' : 'Ctrl K';

  const openPalette = useCallback(() => setOpen(true), []);
  const closePalette = useCallback(() => setOpen(false), []);
  const togglePalette = useCallback(() => setOpen((value) => !value), []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const key = event.key.toLowerCase();
      if (key !== 'k' || !(isMac ? event.metaKey : event.ctrlKey)) return;
      event.preventDefault();
      togglePalette();
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isMac, togglePalette]);

  return { open, setOpen, openPalette, closePalette, togglePalette, shortcutLabel, isMac };
}
