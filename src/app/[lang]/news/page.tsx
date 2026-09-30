import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import CardGrid from '@/components/CardGrid';
import TagList from '@/components/TagList';
import { getContent, portableTextToPlain, toLocale, type NewsPost } from '@/lib/content';
import { croppedImageUrl } from '@/lib/image';

type Props = { params: Promise<{ lang: string }> };

const TITLE = { en: 'News & Writings', de: 'News & Texte' };
const EXCERPT_LENGTH = 160;

// Preview images are shown at 3:2 (landscape), cropped around the hotspot set
// in Sanity; same sizing approach as the team photos (team/page.tsx).
const PREVIEW_ASPECT = 3 / 2;
const PREVIEW_WIDTH = 1200;
const CARD_IMAGE_SIZES = '(max-width: 768px) 100vw, 30vw';

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
              <PreviewImage post={post} />
              <span className="card-kicker">{post.category}</span>
              <h2 className="card-title">{post.title}</h2>
              <span className="date">{post.date}</span>
              <p className="card-text">{excerpt(portableTextToPlain(post.body))}</p>
              <TagList tags={post.tags} />
            </Link>
          ))}
        </CardGrid>
      </main>
    </>
  );
}

function PreviewImage({ post }: { post: NewsPost }) {
  const image = post.previewImage;
  if (!image) {
    // No preview image in Sanity: same-size box with the category, like the
    // team page's photo placeholder. Decorative only — the title follows.
    return (
      <div className="news-preview news-preview-placeholder" aria-hidden="true">
        {post.category}
      </div>
    );
  }
  return (
    <Image
      src={croppedImageUrl(image, PREVIEW_ASPECT, PREVIEW_WIDTH)}
      alt={image.alt}
      width={PREVIEW_WIDTH}
      height={Math.round(PREVIEW_WIDTH / PREVIEW_ASPECT)}
      sizes={CARD_IMAGE_SIZES}
      placeholder={image.lqip ? 'blur' : 'empty'}
      blurDataURL={image.lqip}
      className="news-preview"
    />
  );
}
