// Central content layer — the only place that talks to Sanity.
//
// getContent(locale) queries all Sanity documents (schemas in src/sanity/schemas)
// and maps them to the typed SiteContent shape, picking the `_en` or `_de`
// field for each value (falling back to English when German is empty). Page
// components only call getContent(locale) and never query Sanity directly, so
// schema changes are absorbed here.
import type { PortableTextBlock } from '@portabletext/react';
import type { SanityImageObject } from '@sanity/image-url';
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

// One heading + one rich-text body on a content page (The Project, K.ai).
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

// A Sanity image with its original pixel size and a tiny blurred preview
// (LQIP, a base64 data URL) shown while the real image loads.
// Turned into URLs by lib/image.ts.
export type Image = {
  source: SanityImageObject;
  alt: string;
  width: number;
  height: number;
  lqip?: string;
};

export type Link = { key: string; label: string; url: string };

export type TeamMember = {
  id: string;
  name: string;
  role: string;         // short title above the name
  projectRole: string;  // what they do in Kaspar 2028
  bio: string;
  photo: Image | null;
  links: Link[];        // further links and social media profiles
};

export type Institution = {
  id: string;
  name: string;
  description: string;
  url: string | null;
  logo: Image | null;
};

export type SiteContent = {
  home: { description: string; teaserText: string };
  theProject: { sections: Section[] };
  kai: { sections: Section[] };
  team: { members: TeamMember[]; institutions: Institution[] };
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

// Image fields as returned by the projections in getContent().
type ImageDoc = SanityImageObject & {
  alt?: string;
  lqip?: string;
  dimensions?: { width: number; height: number };
};

type TeamMemberDoc = {
  _id: string;
  name?: string;
  photo?: ImageDoc;
  links?: { _key: string; label?: string; url?: string }[];
  socials?: { _key: string; platform?: string; url?: string }[];
} & Localized<'role', string> & Localized<'projectRole', string> & Localized<'bio', string>;

type InstitutionDoc = {
  _id: string;
  name?: string;
  url?: string;
  logo?: ImageDoc;
} & Localized<'description', string>;

// ---- Helpers ----

// Display names for the social platforms offered in the Studio
// (see SOCIAL_PLATFORMS in src/sanity/schemas/teamMember.ts).
const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  mastodon: 'Mastodon',
  bluesky: 'Bluesky',
  x: 'X',
  github: 'GitHub',
  vimeo: 'Vimeo',
  youtube: 'YouTube',
};

function toImage(doc: ImageDoc | undefined, fallbackAlt: string): Image | null {
  // An image field can exist without an uploaded file (e.g. after removing it).
  if (!doc?.asset || !doc.dimensions) return null;
  const { alt, lqip, dimensions, ...source } = doc;
  return { source, alt: alt || fallbackAlt, width: dimensions.width, height: dimensions.height, lqip };
}

// Extracts plain text from Portable Text, for excerpts. Only looks at text
// blocks (paragraphs, headings, list items); ignores images and other objects.
export function portableTextToPlain(blocks: PortableTextBlock[]): string {
  return blocks
    .filter((b) => b._type === 'block' && Array.isArray(b.children))
    .map((b) => (b.children as { text?: string }[]).map((c) => c.text ?? '').join(''))
    .join(' ');
}

// ---- Fetching ----

// Image projection: the image with its crop/hotspot, plus the original size
// and blurred preview stored in the asset's metadata.
const IMAGE_FIELDS = `{ ..., "lqip": asset->metadata.lqip, "dimensions": asset->metadata.dimensions{ width, height } }`;

// Pages are pre-rendered at build time, then regenerated in the background at
// most once per REVALIDATE_SECONDS when visited (Incremental Static
// Regeneration). This is how edits in the Studio reach the live site without
// a redeploy — expect up to ~1–2 minutes (this + Sanity CDN cache).
const REVALIDATE_SECONDS = 60;
const fetchOptions = { next: { revalidate: REVALIDATE_SECONDS } };

export async function getContent(locale: Locale): Promise<SiteContent> {
  // The queries run in parallel, so the total wait is the slowest one.
  // Team members and institutions: by "Order" field (unset = last), then name.
  const [settings, pages, posts, members, institutions] = await Promise.all([
    client.fetch<SiteSettingsDoc | null>(`*[_type == "siteSettings"][0]`, {}, fetchOptions),
    client.fetch<ContentPageDoc[]>(`*[_type == "contentPage"]`, {}, fetchOptions),
    client.fetch<NewsPostDoc[]>(`*[_type == "newsPost"] | order(date desc)`, {}, fetchOptions),
    client.fetch<TeamMemberDoc[]>(
      `*[_type == "teamMember"] | order(coalesce(order, 9999) asc, name asc) { ..., photo${IMAGE_FIELDS} }`,
      {},
      fetchOptions
    ),
    client.fetch<InstitutionDoc[]>(
      `*[_type == "institution"] | order(coalesce(order, 9999) asc, name asc) { ..., logo${IMAGE_FIELDS} }`,
      {},
      fetchOptions
    ),
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
    team: {
      members: members.map((m) => {
        const name = m.name ?? '';
        const links = (m.links ?? []).map((l) => ({ key: l._key, label: l.label ?? l.url ?? '', url: l.url ?? '' }));
        const socials = (m.socials ?? []).map((l) => ({
          key: l._key,
          label: PLATFORM_LABELS[l.platform ?? ''] ?? l.platform ?? '',
          url: l.url ?? '',
        }));
        return {
          id: m._id,
          name,
          role: pick(m, 'role') ?? '',
          projectRole: pick(m, 'projectRole') ?? '',
          bio: pick(m, 'bio') ?? '',
          photo: toImage(m.photo, name),
          // Entries without a URL (half-filled in the Studio) are left out.
          links: [...links, ...socials].filter((l) => l.url),
        };
      }),
      institutions: institutions.map((i) => ({
        id: i._id,
        name: i.name ?? '',
        description: pick(i, 'description') ?? '',
        url: i.url ?? null,
        logo: toImage(i.logo, i.name ?? ''),
      })),
    },
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
