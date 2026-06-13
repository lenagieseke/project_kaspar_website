# Integrating Sanity CMS

This guide walks through connecting Sanity as the content backend for the Kaspar 2028 website. It assumes you know Next.js and TypeScript but have never used Sanity before.

---

## What is Sanity?

Sanity is a **headless CMS** — it manages content only, with no built-in frontend. Your Next.js site is the frontend that fetches and displays that content.

Sanity has three parts you'll interact with:

| Part | What it is |
|---|---|
| **Content Lake** | Sanity's hosted database. Content lives here, in the cloud. |
| **Studio** | A configurable web admin UI where editors write and publish content. You embed it directly inside your Next.js app. |
| **GROQ API** | The query language your Next.js app uses to fetch content from the Content Lake. |

**How it fits into this project:**  
All content is currently hardcoded in `src/lib/content.ts`. After this integration, `getContent()` fetches live data from Sanity instead. Every page component stays exactly the same — only the data source changes.

---

## Step 1: Create a Sanity Account and Project

1. Go to [sanity.io](https://sanity.io) and create a free account.
2. After signing in, go to **sanity.io/manage** → click **New project**.
3. Give it a name: `kaspar-2028`.
4. Choose the **Free** plan.
5. When asked about a dataset, name it `production`.
6. Note down your **Project ID** — it looks like `abc123xy` and you'll need it shortly.

A **dataset** is like a database environment. Most projects only ever need `production`. If you later want a staging environment for testing, you can add a second dataset called `staging`.

---

## Step 2: Install Sanity Packages

From inside the `v01/` directory:

```bash
npm install next-sanity sanity styled-components
```

The three packages:

| Package | Role |
|---|---|
| `next-sanity` | Official Next.js integration — Sanity client, `NextStudio` embed component, ISR helpers |
| `sanity` | Studio SDK — needed for `defineType`, `defineField`, `defineConfig` in your schema files |
| `styled-components` | Required peer dependency of the Studio UI |

---

## Step 3: Set Up Environment Variables

Create a `.env.local` file at the root of `v01/`:

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_SANITY_DATASET=production
```

Replace `your_project_id_here` with the ID from Step 1.

The `NEXT_PUBLIC_` prefix means Next.js makes these variables available in both server and browser code. That is safe here — the project ID and dataset name are not secrets. (If you later add an API token for authenticated writes or draft previews, **do not** prefix it with `NEXT_PUBLIC_`.)

Make sure `.env.local` is in your `.gitignore`:

```
.env.local
```

---

## Step 4: Create the Sanity Client

Create `src/lib/sanity.ts`:

```ts
import { createClient } from 'next-sanity';

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  // Pin to a specific API version so future Sanity API changes don't silently
  // break your queries. Use today's date when you first set this up.
  apiVersion: '2024-01-01',
  // Use Sanity's global CDN for read requests in production — faster response
  // times at the cost of up to 60s of eventual consistency.
  useCdn: true,
});
```

---

## Step 5: Define Schemas

Schemas are the heart of Sanity — they define what content types exist and what fields each one has. Think of them as TypeScript types, but expressed in a format the Studio can read to build editing UIs automatically.

Create the directory `src/sanity/schemas/` and add the following files.

### `src/sanity/schemas/siteSettings.ts`

A **singleton document** — there is exactly one of these per site. Holds the home page description in both languages.

```ts
import { defineField, defineType } from 'sanity';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'homeDescription_en',
      title: 'Home Description (English)',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'homeDescription_de',
      title: 'Home Description (German)',
      type: 'text',
      rows: 4,
    }),
  ],
});
```

### `src/sanity/schemas/contentPage.ts`

Used for The Project, K.ai, and Team — each has an ordered list of heading + body sections. The `pageId` field identifies which page this document belongs to.

```ts
import { defineField, defineType } from 'sanity';

export const contentPage = defineType({
  name: 'contentPage',
  title: 'Content Page',
  type: 'document',
  fields: [
    defineField({
      name: 'pageId',
      title: 'Page',
      type: 'string',
      options: {
        list: [
          { title: 'The Project', value: 'the-project' },
          { title: 'K.ai',        value: 'kai' },
          { title: 'Team',        value: 'team' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sections',
      title: 'Sections',
      type: 'array',
      // Each section is an inline object (not its own document).
      // Editors can add, remove, and reorder sections in the Studio.
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'heading_en', title: 'Heading (EN)', type: 'string' }),
            defineField({ name: 'heading_de', title: 'Heading (DE)', type: 'string' }),
            defineField({ name: 'body_en',    title: 'Body (EN)',    type: 'text', rows: 5 }),
            defineField({ name: 'body_de',    title: 'Body (DE)',    type: 'text', rows: 5 }),
          ],
          // Controls what the Studio shows in the collapsed list view
          preview: { select: { title: 'heading_en' } },
        },
      ],
    }),
  ],
  preview: { select: { title: 'pageId' } },
});
```

### `src/sanity/schemas/newsPost.ts`

```ts
import { defineField, defineType } from 'sanity';

export const newsPost = defineType({
  name: 'newsPost',
  title: 'News Post',
  type: 'document',
  fields: [
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      // Auto-generates the URL slug from the English title.
      // Editors can also edit it manually before publishing.
      options: { source: 'title_en', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'title_en', title: 'Title (EN)', type: 'string' }),
    defineField({ name: 'title_de', title: 'Title (DE)', type: 'string' }),
    defineField({ name: 'date',     title: 'Date',       type: 'datetime' }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'News',     value: 'news' },
          { title: 'Tutorial', value: 'tutorial' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({ name: 'body_en', title: 'Body (EN)', type: 'text', rows: 8 }),
    defineField({ name: 'body_de', title: 'Body (DE)', type: 'text', rows: 8 }),
  ],
  orderings: [
    {
      title: 'Date, newest first',
      name: 'dateDesc',
      by: [{ field: 'date', direction: 'desc' }],
    },
  ],
  preview: {
    select: { title: 'title_en', subtitle: 'date' },
  },
});
```

### `src/sanity/schemas/index.ts`

Export all schemas from a single file so the Studio config can import them cleanly.

```ts
import { siteSettings } from './siteSettings';
import { contentPage }  from './contentPage';
import { newsPost }     from './newsPost';

export const schemaTypes = [siteSettings, contentPage, newsPost];
```

---

## Step 6: Configure the Studio

After Steps 4 and 5 your `src/sanity/` directory should look like this:

```
src/sanity/
├── sanity.config.ts      ← create this now (Step 6)
└── schemas/
    ├── index.ts
    ├── siteSettings.ts
    ├── contentPage.ts
    └── newsPost.ts
```

> **Common mistake:** `sanity.config.ts` goes directly inside `src/sanity/`, _not_ inside `src/sanity/schemas/`. The Studio page imports it as `@/sanity/sanity.config`, which resolves to `src/sanity/sanity.config.ts`.

Create `src/sanity/sanity.config.ts`:

```ts
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';   // note: not 'sanity/plugins/structure'
import { schemaTypes } from './schemas';

export default defineConfig({
  name: 'kaspar-studio',
  title: 'Kaspar 2028',
  // Required: tells the Studio where it's hosted so its internal navigation
  // URLs are correct. Without this you'll get "Tool not found: studio" because
  // the Studio misreads its own URL path segment as a tool name.
  basePath: '/studio',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,

  plugins: [
    structureTool({
      // Custom sidebar structure. Without this, Sanity would list all document
      // types flat. Here we pin Site Settings as a singleton (so editors can't
      // create a second one) and group pages and posts separately.
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Site Settings')
              .child(
                // documentId pins this to a fixed ID so there's always exactly one
                S.document().schemaType('siteSettings').documentId('siteSettings')
              ),
            S.divider(),
            S.listItem().title('Content Pages').child(
              S.documentTypeList('contentPage')
            ),
            S.listItem().title('News Posts').child(
              S.documentTypeList('newsPost')
            ),
          ]),
    }),
  ],

  schema: { types: schemaTypes },
});
```

---

## Step 7: Embed the Studio in Next.js

Create `src/app/studio/[[...tool]]/page.tsx`:

```tsx
'use client';

import { NextStudio } from 'next-sanity/studio';
import config from '@/sanity/sanity.config';

// [[...tool]] is a Next.js catch-all route. next-sanity needs it to handle
// all the Studio's internal navigation (e.g. /studio/desk/newsPost/abc123).
export default function StudioPage() {
  return <NextStudio config={config} />;
}
```

The Studio is now live at `http://localhost:3000/studio`. Sign in with your Sanity account — the same credentials you used on sanity.io.

**Tip:** In production, you'll want to protect this route so only your team can access it. The simplest way is basic auth via middleware, or you can rely on Sanity's own login (only people added to your Sanity project can publish content).

---

## Step 8: Replace `getContent()` with GROQ Queries

**What is GROQ?**  
GROQ is Sanity's query language. A few basics before you write the queries:

```
*[_type == "newsPost"]          → fetch all documents of type newsPost
| order(date desc)              → sort them newest first
[0]                             → take the first result only
{ title_en, slug }             → return only these fields (like SELECT in SQL)
slug.current                    → access a nested field (slug is an object with a .current string)
```

Now update `src/lib/content.ts`. Keep all the exported types and `navItems` at the top — only replace the hardcoded `content` object and the `getContent` function at the bottom.

**Remove** the `const content: Record<Locale, SiteContent> = { ... }` block and the old `getContent` function, and replace them with:

```ts
import { client } from './sanity';

export async function getContent(locale: Locale): Promise<SiteContent> {
  // Fetch all three content types in parallel — one round trip each,
  // but they run concurrently so total wait time = the slowest one.
  const [settings, pages, posts] = await Promise.all([
    client.fetch(`*[_type == "siteSettings"][0]`),
    client.fetch(`*[_type == "contentPage"]`),
    client.fetch(`*[_type == "newsPost"] | order(date desc)`),
  ]);

  // Helper: find the document for a given page and map its sections to the
  // locale-appropriate heading/body strings.
  function sectionsFor(pageId: string): Section[] {
    const page = (pages ?? []).find((p: any) => p.pageId === pageId);
    return (page?.sections ?? []).map((s: any) => ({
      // Fall back to English if the German field isn't filled in yet —
      // this matches the original Grav site's content_fallback behaviour.
      heading: s[`heading_${locale}`] ?? s.heading_en ?? '',
      body:    s[`body_${locale}`]    ?? s.body_en    ?? '',
    }));
  }

  return {
    home: {
      description:
        settings?.[`homeDescription_${locale}`] ??
        settings?.homeDescription_en ??
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
        body:     p[`body_${locale}`] ?? p.body_en ?? '',
      })),
    },
  };
}
```

Because `getContent()` was already called with `await` in every page component, no page file needs to change.

---

## Step 9: Add Content in the Studio

1. Run `npm run dev` and open `http://localhost:3000/studio`.
2. Sign in with your Sanity account.

**Site Settings:**
- Click **Site Settings** in the sidebar.
- Fill in the home description in both languages.
- Click **Publish** (top right). Content is only visible via the API after publishing — drafts are Studio-only.

**Content Pages:**
- Click **Content Pages** → **New document** (pencil icon).
- Set Page to "The Project", then add sections.
- Publish. Repeat for K.ai and Team.

**News Posts:**
- Click **News Posts** → **New document**.
- The slug auto-generates from the English title — you can edit it before publishing.
- Publish.

---

## Step 10: Allow Your Domain in Sanity CORS Settings

Sanity only accepts API requests from origins you explicitly allow. `localhost` is already allowed for development. Before deploying to production:

1. Go to **sanity.io/manage** → your project → **API** tab → **CORS Origins**.
2. Click **Add CORS origin** and enter your production domain (e.g. `https://kaspar2028.de`).
3. Leave "Allow credentials" unchecked unless you're using authenticated reads.

---

## Caching and Revalidation

By default, Next.js App Router caches `fetch` calls on the server. Sanity's client uses `fetch` internally, so the response is cached for the lifetime of a deployment — meaning editors publish content but visitors don't see it until you redeploy.

**Option A — Revalidate on a timer (ISR):**  
Pass a `next` option to the Sanity client fetch calls to rebuild pages in the background periodically:

```ts
// In sanity.ts, set a revalidation time globally:
export const client = createClient({
  // ...same as before
  useCdn: false, // CDN adds its own cache layer; disable when using Next.js cache
  fetch: { next: { revalidate: 60 } }, // rebuild stale pages every 60 seconds
});
```

**Option B — Revalidate on publish (webhooks):**  
Sanity can call a URL on your server every time content is published. Set up a route like `/api/revalidate` that calls `revalidatePath('/')`, then register it as a webhook in sanity.io/manage. This is the most responsive option — visitors see new content within seconds of publishing.

---

## What's Next

**Rich text (Portable Text):**  
The `type: 'text'` fields used above are plain multi-line strings. For formatted body text with bold, links, and embedded images, replace them with:

```ts
defineField({ name: 'body_en', type: 'array', of: [{ type: 'block' }] })
```

Then install `@portabletext/react` and use `<PortableText value={post.body_en} />` in your components to render it.

**Images:**  
Add an `image` field to any schema, upload images in the Studio, and use `@sanity/image-url` to generate optimised URLs with any crop/size you need.

**Live preview:**  
`next-sanity` supports a presentation mode where editors can see content changes instantly before publishing. It requires adding the `presentationTool` plugin to `sanity.config.ts` and a draft-mode API route in Next.js — the next-sanity docs cover this step by step.
