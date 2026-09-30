// Central content layer — the only place that talks to Sanity.
//
// getContent(locale) queries all Sanity documents (schemas in src/sanity/schemas)
// and maps them to the typed SiteContent shape, picking the `_en` or `_de`
// field for each value (falling back to English when German is empty). Page
// components only call getContent(locale) and never query Sanity directly, so
// schema changes are absorbed here.
import type { PortableTextBlock } from '@portabletext/react';
import type { SanityImageObject } from '@sanity/image-url';
import { SOCIAL_PLATFORMS } from '@/sanity/socialPlatforms';
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
// `anchor` is the heading's id on the page (e.g. "about-the-play"), linked
// from the section submenus in the navigation.
export type Section = { key: string; heading: string; anchor: string; body: PortableTextBlock[] };

// A section link in a navigation submenu.
export type SubNavItem = { anchor: string; label: string };

export type NewsPost = {
  slug: string;
  title: string;
  // Pre-formatted (e.g. "16 March 2026" / "16. März 2026") rather than a Date,
  // so server and client render identical text (no hydration mismatch).
  date: string;
  category: 'news' | 'article' | 'tutorial';
  tags: string[];
  previewImage: Image | null;
  body: RichTextBlock[];
};

// An image placed between paragraphs of a post body.
export type BodyImage = { _type: 'image'; _key: string; image: Image; caption: string };

// Post body: text blocks plus images (rendered by components/RichText.tsx).
export type RichTextBlock = PortableTextBlock | BodyImage;

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
  logo: Image | null;
  links: Link[];        // further links and social media profiles
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
  previewImage?: ImageDoc;
} & Localized<'title', string> & Localized<'body', (PortableTextBlock | BodyImageDoc)[]>;

// Image fields as returned by the projections in getContent().
type ImageDoc = SanityImageObject & {
  alt?: string;
  lqip?: string;
  dimensions?: { width: number; height: number };
};

type BodyImageDoc = ImageDoc & { _type: 'image'; _key: string; caption?: string };

// The "Links" and "Social media" lists (src/sanity/schemas/links.ts).
type LinkFields = {
  links?: { _key: string; label?: string; url?: string }[];
  socials?: { _key: string; platform?: string; url?: string }[];
};

type TeamMemberDoc = {
  _id: string;
  name?: string;
  photo?: ImageDoc;
} & LinkFields & Localized<'role', string> & Localized<'projectRole', string> & Localized<'bio', string>;

type InstitutionDoc = {
  _id: string;
  name?: string;
  logo?: ImageDoc;
} & LinkFields & Localized<'description', string>;

// ---- Helpers ----

// Display names for the social platforms offered in the Studio.
const PLATFORM_LABELS: Record<string, string> = Object.fromEntries(
  SOCIAL_PLATFORMS.map((p) => [p.value, p.title])
);

// Links first, then social profiles (labelled with the platform name).
// Entries without a URL (half-filled in the Studio) are left out.
function toLinks({ links = [], socials = [] }: LinkFields): Link[] {
  return [
    ...links.map((l) => ({ key: l._key, label: l.label || l.url || '', url: l.url ?? '' })),
    ...socials.map((l) => ({
      key: l._key,
      label: PLATFORM_LABELS[l.platform ?? ''] ?? l.platform ?? '',
      url: l.url ?? '',
    })),
  ].filter((l) => l.url);
}

function toImage(doc: ImageDoc | undefined, fallbackAlt: string): Image | null {
  // An image field can exist without an uploaded file (e.g. after removing it).
  if (!doc?.asset || !doc.dimensions) return null;
  const { alt, lqip, dimensions, ...source } = doc;
  return { source, alt: alt || fallbackAlt, width: dimensions.width, height: dimensions.height, lqip };
}

// Converts the images in a post body to the Image shape; drops image blocks
// without an uploaded file.
function toRichText(blocks: (PortableTextBlock | BodyImageDoc)[]): RichTextBlock[] {
  return blocks.flatMap((b): RichTextBlock[] => {
    if (b._type !== 'image') return [b as PortableTextBlock];
    const { _type, _key, caption, ...doc } = b as BodyImageDoc;
    const image = toImage(doc, caption ?? '');
    return image ? [{ _type, _key, image, caption: caption ?? '' }] : [];
  });
}

// "Über das Stück" → "uber-das-stuck": readable, URL-safe anchor ids.
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents (ü → u)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Section submenus for the navigation, keyed by nav item href. Sections
// without a heading have nothing to show, so they are left out.
export function subNavItems(content: SiteContent): Record<string, SubNavItem[]> {
  const toItems = (sections: Section[]) =>
    sections.filter((s) => s.heading).map((s) => ({ anchor: s.anchor, label: s.heading }));
  return {
    '/the-project': toItems(content.theProject.sections),
    '/kai': toItems(content.kai.sections),
  };
}

// Extracts plain text from Portable Text, for excerpts. Only looks at text
// blocks (paragraphs, headings, list items); ignores images and other objects.
export function portableTextToPlain(blocks: RichTextBlock[]): string {
  return blocks
    .filter((b): b is PortableTextBlock => b._type === 'block' && 'children' in b && Array.isArray(b.children))
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
    client.fetch<NewsPostDoc[]>(
      `*[_type == "newsPost"] | order(date desc) {
        ...,
        previewImage${IMAGE_FIELDS},
        body_en[]{ ..., _type == "image" => ${IMAGE_FIELDS} },
        body_de[]{ ..., _type == "image" => ${IMAGE_FIELDS} }
      }`,
      {},
      fetchOptions
    ),
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
    const used = new Set<string>();
    return (page?.sections ?? []).map((s) => {
      const heading: string = pick(s, 'heading') ?? '';
      // Unique on the page: a repeated heading gets "-2", "-3", …
      const base = slugify(heading) || s._key;
      let anchor = base;
      for (let n = 2; used.has(anchor); n++) anchor = `${base}-${n}`;
      used.add(anchor);
      return { key: s._key, heading, anchor, body: pick(s, 'body') ?? [] };
    });
  }

  return {
    home: {
      description: pick(settings, 'homeDescription') ?? '',
      teaserText: pick(settings, 'teaserText') ?? '',
    },
    theProject: { sections: sectionsFor('the-project') },
    kai:        { sections: sectionsFor('kai') },
    team: {
      members: members.map((m) => ({
        id: m._id,
        name: m.name ?? '',
        role: pick(m, 'role') ?? '',
        projectRole: pick(m, 'projectRole') ?? '',
        bio: pick(m, 'bio') ?? '',
        photo: toImage(m.photo, m.name ?? ''),
        links: toLinks(m),
      })),
      institutions: institutions.map((i) => ({
        id: i._id,
        name: i.name ?? '',
        description: pick(i, 'description') ?? '',
        logo: toImage(i.logo, i.name ?? ''),
        links: toLinks(i),
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
                // The server runs in UTC; without this a post dated shortly
                // after midnight German time would show the previous day.
                timeZone: 'Europe/Berlin',
              })
            : '',
          category: p.category ?? 'news',
          tags: p.tags ?? [],
          previewImage: toImage(p.previewImage, pick(p, 'title') ?? ''),
          body: toRichText(pick(p, 'body') ?? []),
        })),
    },
  };
}
