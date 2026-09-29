import type { Metadata } from 'next';
import Link from 'next/link';
import CardGrid from '@/components/CardGrid';
import { getContent, portableTextToPlain, toLocale } from '@/lib/content';

type Props = { params: Promise<{ lang: string }> };

const TITLE = { en: 'News & Writings', de: 'News & Texte' };
const EXCERPT_LENGTH = 160;

function excerpt(text: string): string {
  return text.length > EXCERPT_LENGTH ? `${text.slice(0, EXCERPT_LENGTH).trimEnd()}…` : text;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  return { title: `${TITLE[locale]} | Kaspar 2028` };
}

export default async function NewsPage({ params }: Props) {
  const locale = toLocale((await params).lang);
  const { news } = await getContent(locale);
  const title = TITLE[locale];

  return (
    <>
      <div className="page-title-header">
        <h1 className="page-title">{title}</h1>
      </div>
      <main id="main-content">
        <CardGrid>
          {news.posts.map((post) => (
            <Link key={post.slug} href={`/${locale}/news/${post.slug}`} className="news-card-link">
              <span className="card-kicker">{post.category}</span>
              <h2 className="card-title">{post.title}</h2>
              <span className="date">{post.date}</span>
              <p className="card-text">{excerpt(portableTextToPlain(post.body))}</p>
            </Link>
          ))}
        </CardGrid>
      </main>
    </>
  );
}
