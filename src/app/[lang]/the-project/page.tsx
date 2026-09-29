import type { Metadata } from 'next';
import ContentPage from '@/components/ContentPage';
import { getContent, toLocale } from '@/lib/content';

type Props = { params: Promise<{ lang: string }> };

const TITLE = { en: 'The Project', de: 'Das Projekt' };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  return { title: `${TITLE[locale]} | Kaspar 2028` };
}

export default async function TheProjectPage({ params }: Props) {
  const locale = toLocale((await params).lang);
  const { theProject } = await getContent(locale);
  return <ContentPage title={TITLE[locale]} sections={theProject.sections} />;
}
