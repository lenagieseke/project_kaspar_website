// Central content layer — the only place that talks to Sanity.
//
// getContent(locale) queries all Sanity documents (schemas in src/sanity/schemas)
// and maps them to the typed SiteContent shape, picking the `_en` or `_de`
// field for each value (falling back to English when German is empty). Page
// components only call getContent(locale) and never query Sanity directly, so
// schema changes are absorbed here.
import type { PortableTextBlock } from '@portabletext/react';
import { client } from './sanity';

// ---- Locales ----

export type Locale = 'en' | 'de';
export const locales: Locale[] = ['en', 'de'];

export function isLocale(value: string): value is Locale {
  return (locales as string[]).includes(value);
}

// Turns the [lang] URL segment into a Locale. The [lang] layout already
// returns 404 for anything else, so the English fallback is just a safe default.
export function toLocale(lang: string): Locale {
  return isLocale(lang) ? lang : 'en';
}

// ---- Navigation ----

export type NavItem = {
  href: string;
  label: Record<Locale, string>;
};

// Single source of truth for nav links. Adding or removing a page means
// editing this array — the Navigation component iterates it at runtime.
export const navItems: NavItem[] = [
  { href: '/the-project', label: { en: 'The Project',     de: 'Das Projekt' } },
  { href: '/kai',         label: { en: 'K.ai',            de: 'K.ai' } },
  { href: '/team',        label: { en: 'Team',            de: 'Team' } },
  { href: '/news',        label: { en: 'News & Writings', de: 'News & Texte' } },
];

// ---- Content types (what pages receive) ----

// One heading + one rich-text body on a content page (The Project, K.ai, Team).
// `key` is Sanity's stable array-item id, used as the React list key.
export type Section = { key: string; heading: string; body: PortableTextBlock[] };

export type NewsPost = {
  slug: string;
  title: string;
  // Pre-formatted (e.g. "16 March 2026" / "16. März 2026") rather than a Date,
  // so server and client render identical text (no hydration mismatch).
  date: string;
  category: 'news' | 'article' | 'tutorial';
  tags: string[];
  body: PortableTextBlock[];
};

export type SiteContent = {
  home: { description: string; teaserText: string };
  theProject: { sections: Section[] };
  kai: { sections: Section[] };
  team: { sections: Section[] };
  news: { posts: NewsPost[] };
};

// ---- Raw Sanity document shapes (what the queries return) ----
// Every field may be missing while an editor hasn't filled it in yet.

type Localized<Name extends string, T> = { [K in `${Name}_${Locale}`]?: T };

type SiteSettingsDoc =
  Localized<'homeDescription', string> & Localized<'teaserText', string>;

type SectionItem = { _key: string } &
  Localized<'heading', string> & Localized<'body', PortableTextBlock[]>;

type ContentPageDoc = { pageId?: string; sections?: SectionItem[] };

type NewsPostDoc = {
  slug?: { current?: string };
  date?: string;
  category?: NewsPost['category'];
  tags?: string[];
} & Localized<'title', string> & Localized<'body', PortableTextBlock[]>;

// ---- Helpers ----

// Extracts plain text from Portable Text, for excerpts. Only looks at text
// blocks (paragraphs, headings, list items); ignores images and other objects.
export function portableTextToPlain(blocks: PortableTextBlock[]): string {
  return blocks
    .filter((b) => b._type === 'block' && Array.isArray(b.children))
    .map((b) => (b.children as { text?: string }[]).map((c) => c.text ?? '').join(''))
    .join(' ');
}

// ---- Fetching ----

// Pages are pre-rendered at build time, then regenerated in the background at
// most once per REVALIDATE_SECONDS when visited (Incremental Static
// Regeneration). This is how edits in the Studio reach the live site without
// a redeploy — expect up to ~1–2 minutes (this + Sanity CDN cache).
const REVALIDATE_SECONDS = 60;
const fetchOptions = { next: { revalidate: REVALIDATE_SECONDS } };

export async function getContent(locale: Locale): Promise<SiteContent> {
  // The three queries run in parallel, so the total wait is the slowest one.
  const [settings, pages, posts] = await Promise.all([
    client.fetch<SiteSettingsDoc | null>(`*[_type == "siteSettings"][0]`, {}, fetchOptions),
    client.fetch<ContentPageDoc[]>(`*[_type == "contentPage"]`, {}, fetchOptions),
    client.fetch<NewsPostDoc[]>(`*[_type == "newsPost"] | order(date desc)`, {}, fetchOptions),
  ]);

  // Picks the field for the current locale, falling back to English if the
  // German one isn't filled in yet.
  function pick<Name extends string, T>(doc: Localized<Name, T> | null | undefined, name: Name): T | undefined {
    const fields = doc as Record<string, T | undefined> | null | undefined;
    return fields?.[`${name}_${locale}`] ?? fields?.[`${name}_en`];
  }

  function sectionsFor(pageId: string): Section[] {
    const page = pages.find((p) => p.pageId === pageId);
    return (page?.sections ?? []).map((s) => ({
      key: s._key,
      heading: pick(s, 'heading') ?? '',
      body: pick(s, 'body') ?? [],
    }));
  }

  return {
    home: {
      description: pick(settings, 'homeDescription') ?? '',
      teaserText: pick(settings, 'teaserText') ?? '',
    },
    theProject: { sections: sectionsFor('the-project') },
    kai:        { sections: sectionsFor('kai') },
    team:       { sections: sectionsFor('team') },
    news: {
      posts: posts
        // A post without a slug has no URL, so it can't be listed.
        .filter((p) => p.slug?.current)
        .map((p) => ({
          slug: p.slug!.current!,
          title: pick(p, 'title') ?? '',
          date: p.date
            ? new Date(p.date).toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
            : '',
          category: p.category ?? 'news',
          tags: p.tags ?? [],
          body: pick(p, 'body') ?? [],
        })),
    },
  };
}
