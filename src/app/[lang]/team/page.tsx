import type { Metadata } from 'next';
import ContentPage from '@/components/ContentPage';
import { getContent, toLocale } from '@/lib/content';

type Props = { params: Promise<{ lang: string }> };

export const metadata: Metadata = { title: 'Team | Kaspar 2028' };

export default async function TeamPage({ params }: Props) {
  const locale = toLocale((await params).lang);
  const { team } = await getContent(locale);
  return <ContentPage title="Team" sections={team.sections} />;
}
