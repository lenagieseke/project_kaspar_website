import type { Metadata } from 'next';
import { Fragment } from 'react';
import { PortableText } from '@portabletext/react';
import { getContent, type Locale } from '@/lib/content';

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: lang === 'de' ? 'Das Projekt | Kaspar 2028' : 'The Project | Kaspar 2028',
  };
}

export default async function TheProjectPage({ params }: Props) {
  const { lang } = await params;
  const locale: Locale = lang === 'de' ? 'de' : 'en';
  const { theProject } = await getContent(locale);
  const title = locale === 'de' ? 'Das Projekt' : 'The Project';

  return (
    <>
      <div className="page-title-header">
        <h1 className="page-title">{title}</h1>
      </div>
      <main id="main-content">
        <div className="project-wrapper">
          {theProject.sections.map((section) => (
            <Fragment key={section.heading}>
              <h1>{section.heading}</h1>
              <div className="portable-text"><PortableText value={section.body} /></div>
            </Fragment>
          ))}
        </div>
      </main>
    </>
  );
}
