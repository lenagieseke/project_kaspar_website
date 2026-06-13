import type { Metadata } from 'next';
import { Fragment } from 'react';
import { PortableText } from '@portabletext/react';
import { getContent, type Locale } from '@/lib/content';

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'K.ai | Kaspar 2028' };
}

export default async function KaiPage({ params }: Props) {
  const { lang } = await params;
  const locale: Locale = lang === 'de' ? 'de' : 'en';
  const { kai } = await getContent(locale);

  return (
    <>
      <div className="page-title-header">
        <h1 className="page-title">K.ai</h1>
      </div>
      <main id="main-content">
        <div className="project-wrapper">
          {kai.sections.map((section) => (
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
