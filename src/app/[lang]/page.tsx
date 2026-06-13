// Home page: full-viewport physics teaser followed by a short description.
// The teaser occupies 100vh, so the description is only visible after scrolling.
// Structure mirrors the original Grav template where #teaser precedes #main-content.

import type { Metadata } from 'next';
import Teaser from '@/components/Teaser';
import { getContent, type Locale } from '@/lib/content';

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: lang === 'de' ? 'Kaspar 2028' : 'Kaspar 2028',
  };
}

export default async function HomePage({ params }: Props) {
  const { lang } = await params;
  const locale: Locale = lang === 'de' ? 'de' : 'en';
  const content = await getContent(locale);

  return (
    <>
      {/* Teaser is a client component: it needs window dimensions and
          Matter.js, which are browser-only. It renders a <div id="teaser">
          with a <canvas> inside — see Teaser.tsx for the physics setup. */}
      <Teaser text={content.home.teaserText} />

      <main id="main-content" className="home-content">
        {/* project-wrapper gives the paragraph the same grid-inset layout
            as content sections on other pages (columns 4–8 on desktop). */}
        <div className="project-wrapper">
          <p>{content.home.description}</p>
        </div>
      </main>
    </>
  );
}
