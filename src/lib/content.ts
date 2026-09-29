// Central content layer — the only place that talks to Sanity.
//
// getContent(locale) queries all Sanity documents (schemas in src/sanity/schemas)
// and maps them to the typed SiteContent shape, picking the `_en` or `_de`
// field for each value. Page components only call getContent(locale) and never
// query Sanity directly, so schema changes are absorbed here.
//
// Dates are stored as pre-formatted strings (not Date objects) to avoid
// server/client hydration mismatches when rendering them inside JSX.
import { client } from './sanity';

export type Locale = 'en' | 'de';
export const locales: Locale[] = ['en', 'de'];

export type NavItem = {
  href: string;
  label: Record<Locale, string>;
};

// Single source of truth for nav links. Adding or removing a page means
// editing this array — the Navigation component iterates it at runtime.
export const navItems: NavItem[] = [
  { href: '/the-project', label: { en: 'The Project', de: 'Das Projekt' } },
  { href: '/kai',         label: { en: 'K.ai',        de: 'K.ai' } },
  { href: '/team',        label: { en: 'Team',         de: 'Team' } },
  { href: '/news',        label: { en: 'News & Writings', de: 'News & Texte' } },
];

// Section is the shared shape for all content pages (The Project, K.ai, Team).
// Each section maps to one h1 + one PortableText block in the project-wrapper layout.
// body is a Portable Text array (Sanity block content), not a plain string.
export type Section = { heading: string; body: any[] };

export type NewsPost = {
  slug: string;
  title: string;
  date: string; // pre-formatted string, e.g. "Mar 16, 2026"
  category: 'news' | 'article' | 'tutorial';
  tags: string[];
  body: any[]; // Portable Text array
};

// Extracts a plain-text string from a Portable Text array for use in excerpts.
// Only looks at paragraph blocks (ignores headings, lists, etc.).
export function portableTextToPlain(blocks: any[]): string {
  return (blocks ?? [])
    .filter((b) => b._type === 'block' && b.children)
    .map((b) => b.children.map((c: any) => c.text ?? '').join(''))
    .join(' ');
}

// SiteContent defines the expected shape of data for every page. When Sanity
// is added, the GROQ query result should be cast to (or validated against) this type.
export type SiteContent = {
  home: { description: string; teaserText: string };
  theProject: { sections: Section[] };
  kai: { sections: Section[] };
  team: { sections: Section[] };
  news: { posts: NewsPost[] };
};

// Pages are pre-rendered at build time, then regenerated in the background at
// most once per REVALIDATE_SECONDS when visited (Incremental Static
// Regeneration). This is how edits in the Studio reach the live site without
// a redeploy — expect up to ~1–2 minutes (this + Sanity CDN cache).
const REVALIDATE_SECONDS = 60;
const fetchOptions = { next: { revalidate: REVALIDATE_SECONDS } };

export async function getContent(locale: Locale): Promise<SiteContent> {
  // Fetch all three content types in parallel — one round trip each,
  // but they run concurrently so total wait time = the slowest one.
  const [settings, pages, posts] = await Promise.all([
    client.fetch(`*[_type == "siteSettings"][0]`, {}, fetchOptions),
    client.fetch(`*[_type == "contentPage"]`, {}, fetchOptions),
    client.fetch(`*[_type == "newsPost"] | order(date desc)`, {}, fetchOptions),
  ]);

  // Helper: find the document for a given page and map its sections to the
  // locale-appropriate heading/body strings.
  function sectionsFor(pageId: string): Section[] {
    const page = (pages ?? []).find((p: any) => p.pageId === pageId);
    return (page?.sections ?? []).map((s: any) => ({
      // Fall back to English if the German field isn't filled in yet —
      // this matches the original Grav site's content_fallback behaviour.
      heading: s[`heading_${locale}`] ?? s.heading_en ?? '',
      body:    s[`body_${locale}`] ?? s.body_en ?? [],
    }));
  }

  return {
    home: {
      description:
        settings?.[`homeDescription_${locale}`] ??
        settings?.homeDescription_en ??
        '',
      teaserText:
        settings?.[`teaserText_${locale}`] ??
        settings?.teaserText_en ??
        '',
    },
    theProject: { sections: sectionsFor('the-project') },
    kai:         { sections: sectionsFor('kai') },
    team:        { sections: sectionsFor('team') },
    news: {
      posts: (posts ?? []).map((p: any) => ({
        slug:     p.slug?.current ?? '',
        title:    p[`title_${locale}`] ?? p.title_en ?? '',
        date:     p.date
                    ? new Date(p.date).toLocaleDateString(
                        locale === 'de' ? 'de-DE' : 'en-GB',
                        { day: 'numeric', month: 'long', year: 'numeric' }
                      )
                    : '',
        category: p.category ?? 'news',
        tags:     p.tags ?? [],
        body:     p[`body_${locale}`] ?? p.body_en ?? [],
      })),
    },
  };
}

