import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PortableText } from '@portabletext/react';
import { getContent, locales, toLocale } from '@/lib/content';

type Props = { params: Promise<{ lang: string; slug: string }> };

// Pre-render every post at build time. Posts published later are rendered on
// their first visit (dynamicParams defaults to true).
export async function generateStaticParams() {
  const results = await Promise.all(
    locales.map(async (lang) => {
      const content = await getContent(lang);
      return content.news.posts.map((post) => ({ lang, slug: post.slug }));
    })
  );
  return results.flat();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = toLocale(lang);
  const { news } = await getContent(locale);
  const post = news.posts.find((p) => p.slug === slug);
  return { title: post ? `${post.title} | Kaspar 2028` : 'Kaspar 2028' };
}

export default async function NewsArticle({ params }: Props) {
  const { lang, slug } = await params;
  const locale = toLocale(lang);
  const { news } = await getContent(locale);
  const post = news.posts.find((p) => p.slug === slug);

  if (!post) notFound();

  return (
    <>
      <div className="page-title-header">
        <h1 className="page-title">{post.title}</h1>
      </div>
      <main id="main-content">
        <article className="article-body">
          <span className="date">{post.date}</span>
          <div className="portable-text">
            <PortableText value={post.body} />
          </div>
        </article>
      </main>
    </>
  );
}
