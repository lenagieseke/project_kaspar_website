import type { Metadata } from 'next';
import Link from 'next/link';
import { getContent, portableTextToPlain, type Locale } from '@/lib/content';

type Props = { params: Promise<{ lang: string }> };

// Vertical offsets applied per card to break the uniform grid feeling.
// Index-based (not Math.random) so server and client render the same values
// and there's no React hydration mismatch.
const CARD_OFFSETS = [0, 40, -20, 30, -40, 10, -15, 35, -25];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return { title: lang === 'de' ? 'News & Texte | Kaspar 2028' : 'News & Writings | Kaspar 2028' };
}

export default async function NewsPage({ params }: Props) {
  const { lang } = await params;
  const locale: Locale = lang === 'de' ? 'de' : 'en';
  const { news } = await getContent(locale);
  const title = locale === 'de' ? 'News & Texte' : 'News & Writings';

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
                <p className="news-card-excerpt">{portableTextToPlain(post.body).slice(0, 160)}&hellip;</p>
              </Link>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
