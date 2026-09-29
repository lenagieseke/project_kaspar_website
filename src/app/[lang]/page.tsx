// Home page: the falling-text teaser as a background layer, with the project
// description at the bottom of the screen (desktop) or starting 70% down the
// screen with the rest reached by scrolling (phones). Layout: globals.css.

import Teaser from '@/components/Teaser';
import { getContent, toLocale } from '@/lib/content';

type Props = { params: Promise<{ lang: string }> };

export default async function HomePage({ params }: Props) {
  const locale = toLocale((await params).lang);
  const { home } = await getContent(locale);

  return (
    <>
      {/* Client component (needs the browser and Matter.js). Renders a canvas
          behind the whole page — see Teaser.tsx for the physics. */}
      <Teaser text={home.teaserText} />

      {/* This <main> fills the space between header and footer and pushes
          the description to the bottom. */}
      <main id="main-content" className="home-content">
        {/* project-wrapper gives the paragraph the same grid inset as content
            sections on other pages. data-teaser-obstacle turns it into a solid
            body in the physics world, so falling text lands on it and slides
            around it. */}
        <div className="project-wrapper">
          <p className="home-description" data-teaser-obstacle>
            {home.description}
          </p>
        </div>
      </main>
    </>
  );
}
