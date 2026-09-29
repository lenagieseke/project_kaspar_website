import type { Metadata } from 'next';
import Link from 'next/link';
import { getContent, portableTextToPlain, toLocale } from '@/lib/content';

type Props = { params: Promise<{ lang: string }> };

// Vertical offsets applied per card to break the uniform grid feeling.
// Index-based (not Math.random) so server and client render the same values
// and there's no React hydration mismatch.
const CARD_OFFSETS = [0, 40, -20, 30, -40, 10, -15, 35, -25];

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
        <div className="news-grid">
          {news.posts.map((post, i) => (
            <article
              key={post.slug}
              className="news-card"
              style={{ transform: `translateY(${CARD_OFFSETS[i % CARD_OFFSETS.length]}px)` }}
            >
              <Link href={`/${locale}/news/${post.slug}`} className="news-card-link">
                <span className="news-card-category">{post.category}</span>
                <h2 className="news-card-title">{post.title}</h2>
                <span className="date">{post.date}</span>
                <p className="news-card-excerpt">{excerpt(portableTextToPlain(post.body))}</p>
              </Link>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
