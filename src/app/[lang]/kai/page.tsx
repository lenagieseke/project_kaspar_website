import type { Metadata } from 'next';
import ContentPage from '@/components/ContentPage';
import { getContent, toLocale } from '@/lib/content';

type Props = { params: Promise<{ lang: string }> };

export const metadata: Metadata = { title: 'K.ai | Kaspar 2028' };

export default async function KaiPage({ params }: Props) {
  const locale = toLocale((await params).lang);
  const { kai } = await getContent(locale);
  return <ContentPage title="K.ai" sections={kai.sections} />;
}
