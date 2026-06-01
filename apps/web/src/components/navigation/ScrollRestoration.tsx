import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

function shouldKeepFocus() {
  const active = document.activeElement;
  return active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement || active instanceof HTMLSelectElement;
}

export function ScrollRestoration() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const previousPathname = useRef(location.pathname);

  useEffect(() => {
    if (navigationType === 'POP') {
      previousPathname.current = location.pathname;
      return;
    }

    const pathnameChanged = previousPathname.current !== location.pathname;
    previousPathname.current = location.pathname;
    if (!pathnameChanged && !location.hash) return;

    const frame = window.requestAnimationFrame(() => {
      if (location.hash) {
        const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
        if (target) {
          target.scrollIntoView({ block: 'start' });
          return;
        }
      }

      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      const main = document.getElementById('main-content');
      if (main && !shouldKeepFocus()) main.focus({ preventScroll: true });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [location.hash, location.pathname, navigationType]);

  return null;
}
