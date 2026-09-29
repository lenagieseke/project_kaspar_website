# Kaspar 2028 — Website


The site is a bilingual (EN/DE) Next.js app. Content is edited in Sanity, a hosted headless CMS (meaning it stores and edits our content but doesn't build the website), whose editor ("Studio") is built into the site at `/studio`.


---

## Tech stack

| Layer                       | Technology                                                                                                                                                                                                                                                    |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Base Structure              | [Next.js 16](https://nextjs.org) (App Router), React 19, TypeScript                                                                                                                                                                                           |
| Content                     | [Sanity](https://sanity.io) v5 via `next-sanity` (Sanity's official add-on for connecting Sanity to a Next.js site) and rich text rendered with `@portabletext/react` (library that turns that data into real HTML as Sanity doesn't store rich text as HTML) |
| Styling                     | CSS in `src/styles/globals.css`, plus Tailwind CSS 3 (config in `tailwind.config.ts`)                                                                                                                                                                         |
| Fonts                       | Libre Caslon Display (headings) + Inter (body), loaded from Google Fonts                                                                                                                                                                                      |
| Teaser animation            | Canvas 2D + [Matter.js](https://brm.io/matter-js/) physics                                                                                                                                                                                                    |
| i18n (internationalization) | `[lang]` route segment + `src/proxy.ts` for locale redirects, every page lives once under [lang], the language is always the first part of the URL, and proxy.ts adds the language to the URL when a link leaves it out                                       |


---

## Project structure

```
src/
├── proxy.ts                    # locale redirect (runs before each request)
├── app/
│   ├── [lang]/
│   │   ├── layout.tsx          # root layout: <html lang>, fonts, CSS, metadata, header, nav, footer
│   │   ├── page.tsx            # HOME: teaser + description
│   │   ├── the-project/        # contentPage "the-project"
│   │   ├── kai/                # contentPage "kai"
│   │   ├── team/               # contentPage "team"
│   │   ├── news/               # post list + news/[slug] detail page
│   │   └── impressum/          # imprint (hardcoded, not in Sanity)
│   └── studio/
│       ├── layout.tsx          # separate root layout for the Studio (no site CSS/chrome)
│       └── [[...tool]]/        # embedded Sanity Studio
├── components/
│   ├── Teaser.tsx              # falling-text physics animation (client component)
│   └── Navigation.tsx          # nav links, active state, mobile hamburger
├── lib/
│   ├── content.ts              # getContent(), types, navItems
│   └── sanity.ts               # Sanity client
├── sanity/
│   ├── sanity.config.ts        # Studio config + sidebar structure
│   └── schemas/                # siteSettings, contentPage, newsPost
└── styles/globals.css          # most of the styling
public/                         # favicons, web manifest
docs/sanity-integration.md      # step-by-step guide to how Sanity was set up
```

---

## Getting started

Requirements: Node.js 20+ and access to the Sanity project.

```bash
npm install
```

TODO: More details on signing up in sanity to be able to access the backend - we do that later
Create `.env.local` in the project root. It is git-ignored, so it has to be created on every new machine:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=<your project id>
NEXT_PUBLIC_SANITY_DATASET=production
```

Your project ID is listed at [sanity.io/manage](https://sanity.io/manage).

```bash
npm run dev      # dev server → http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
npm run lint
```

- Site: http://localhost:3000 (redirects to `/en`)
- CMS: http://localhost:3000/studio (sign in with your Sanity account)

The first time the Studio runs on a new URL (for example localhost or a new domain), add that URL as a CORS origin in the Sanity project settings (sanity.io/manage → API → CORS origins).

---

## How it fits together

```
Editor ──► /studio (Sanity Studio, embedded)
                │  saves to
                ▼
        Sanity Content Lake (hosted)
                │  GROQ queries
                ▼
   src/lib/content.ts  getContent(locale)
                │  typed SiteContent
                ▼
   src/app/[lang]/**/page.tsx  ──► HTML
```

- **All content fetching goes through one function:** `getContent(locale)` in `src/lib/content.ts`. It queries the three Sanity document types, picks the `_en` or `_de` field for each value, and falls back to English when the German one is empty. Pages only use the typed result and never query Sanity themselves.
- **Localisation is done with separate fields, not separate documents.** Every translatable field exists twice, e.g. `title_en` / `title_de`.
- **Routing:** all pages live under `src/app/[lang]/`. `src/proxy.ts` sends `/` to `/en`. A path without a language prefix is sent to `/de/...` or `/en/...` based on the browser's `Accept-Language` header. (`proxy.ts` is the Next.js 16 name for what used to be `middleware.ts`.) There is no top-level `app/layout.tsx`: the site (`[lang]/layout.tsx`) and the Studio (`studio/layout.tsx`) each have their own root layout, so the site can set `<html lang="de">` on German pages.
- **Caching:** pages are pre-rendered at build time and then refreshed in the background at most once a minute when someone visits them (`REVALIDATE_SECONDS` in `src/lib/content.ts`). Edits made in Sanity show up on the live site within about 1–2 minutes, without a redeploy. New news posts work immediately, because unknown slugs are rendered on first visit.

### Content model (Sanity schemas)

| Type           | Purpose                                            | Fields                                                                          |
| -------------- | -------------------------------------------------- | ------------------------------------------------------------------------------- |
| `siteSettings` | Singleton (exactly one document) for the home page | `homeDescription_*`, `teaserText_*` (the text that falls in the teaser)         |
| `contentPage`  | The Project, K.ai, Team                            | `pageId` + a list of `sections` (`heading_*`, `body_*` as Portable Text)        |
| `newsPost`     | News & Writings                                    | `slug`, `title_*`, `date`, `category` (news/article/tutorial), `tags`, `body_*` |

The Studio's sidebar (Site Settings pinned at the top, then pages and posts) is defined in `src/sanity/sanity.config.ts`.


---

## Common tasks

- **Edit text or posts:** use `/studio`. No code changes are needed.
- **Change the home page layout:** `src/app/[lang]/page.tsx`. To change the teaser's look or behaviour, edit `src/components/Teaser.tsx`.
- **Add a nav link:** add an entry to `navItems` in `src/lib/content.ts`.
- **Add a new content page:**
  1. Add its `pageId` to the options list in `schemas/contentPage.ts`.
  2. Add a key for it to `SiteContent` and `getContent()`.
  3. Create `src/app/[lang]/<page>/page.tsx`, copying `kai/page.tsx` as a template.
  4. Add a nav link.
- **Change styles:** most styling is in `src/styles/globals.css`. It uses a 10-column grid; `.project-wrapper` is the inset content column. There's one responsive breakpoint at 768px, below which the hamburger menu appears.

---

## Deployment (GitHub → Render)

The code is on GitHub (`lenagieseke/project_kaspar_website`) and hosted on [Render](https://render.com) as a Node web service. The service is defined in `render.yaml`, a "Blueprint" that Render reads from the repo. The Node version is set to 22 there and in `.node-version`.

**First-time setup**

1. Push the repo to GitHub, including `render.yaml`.
2. In Render: **New → Blueprint**, connect the GitHub repo, and select it.
3. When asked, enter `NEXT_PUBLIC_SANITY_PROJECT_ID`. The dataset is already set to `production`.
4. After the first deploy, add the Render URL (e.g. `https://kaspar-website.onrender.com`) as a CORS origin in Sanity, with **Allow credentials** checked (sanity.io/manage → API → CORS origins). Without this, `/studio` won't work on the live site.
5. If a custom domain is added later, add it in Render (Settings → Custom Domains) and as a Sanity CORS origin too.

**Day to day**

- **Code changes:** push to `main`. Render rebuilds and deploys automatically (~2–4 min).
- **Content changes:** edit in `/studio` on the live site. The edits appear within ~1–2 min, with no deploy needed (see *Caching* above).

**Free plan caveat:** a free Render service goes to sleep after ~15 minutes without visitors, and the next visit then takes about a minute to load. For a public launch, switch `plan: free` to `starter` in `render.yaml` (or change it in the dashboard).
