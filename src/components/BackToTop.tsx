// Small arrow in the bottom-right corner that scrolls back to the top.
// It fades in once the page has been scrolled down a bit (see
// .back-to-top in globals.css). Client component: needs scroll events.
'use client';

import { useEffect, useState } from 'react';
import type { Locale } from '@/lib/content';

// How far (in px) the page must be scrolled before the arrow appears.
const SHOW_AFTER = 200;

const LABEL = { en: 'Back to top', de: 'Nach oben' };

export default function BackToTop({ lang }: { lang: Locale }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // setVisible with an unchanged value doesn't re-render, so updating on
    // every scroll event is cheap.
    const update = () => setVisible(window.scrollY > SHOW_AFTER);
    update(); // e.g. after a reload that restores the scroll position
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  function scrollToTop() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  return (
    <button
      type="button"
      className={`back-to-top${visible ? ' visible' : ''}`}
      onClick={scrollToTop}
      aria-label={LABEL[lang]}
      // Hidden from keyboard and screen readers while invisible.
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
    >
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path d="M12 20V4M5 11l7-7 7 7" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </button>
  );
}
