// Three-column card grid used by the News list and the Team page (styles:
// .card-grid / .card in globals.css). Each card is nudged up or down a little
// to break the uniform grid; on phones the cards stack without offsets.

import { Children } from 'react';

// Index-based (not Math.random) so server and client render the same values
// and there's no React hydration mismatch.
const CARD_OFFSETS = [0, 40, -20, 30, -40, 10, -15, 35, -25];

export default function CardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="card-grid">
      {Children.map(children, (child, i) => (
        <article className="card" style={{ transform: `translateY(${CARD_OFFSETS[i % CARD_OFFSETS.length]}px)` }}>
          {child}
        </article>
      ))}
    </div>
  );
}
