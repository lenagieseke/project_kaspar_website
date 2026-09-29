// Shared layout for the Sanity-driven content pages (The Project, K.ai, Team):
// a large page title, then each section as a heading + rich-text body in the
// alternating project-wrapper grid (see globals.css).

import { Fragment } from 'react';
import { PortableText } from '@portabletext/react';
import type { Section } from '@/lib/content';

type Props = { title: string; sections: Section[] };

export default function ContentPage({ title, sections }: Props) {
  return (
    <>
      <div className="page-title-header">
        <h1 className="page-title">{title}</h1>
      </div>
      <main id="main-content">
        <div className="project-wrapper">
          {sections.map((section) => (
            <Fragment key={section.key}>
              <h1>{section.heading}</h1>
              <div className="portable-text">
                <PortableText value={section.body} />
              </div>
            </Fragment>
          ))}
        </div>
      </main>
    </>
  );
}
