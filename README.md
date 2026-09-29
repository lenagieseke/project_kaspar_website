# Kaspar 2028 — Website


The site is a bilingual (EN/DE) Next.js app. Content is edited in Sanity, a hosted headless CMS (meaning it stores and edits our content but doesn't build the website), whose editor ("Studio") is built into the site at `/studio`.


---

## Tech stack

| Layer                       | Technology                                                                                                                                                                                                                                                    |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Base Structure              | [Next.js 16](https://nextjs.org) (App Router), React 19, TypeScript                                                                                                                                                                                           |
| Content                     | [Sanity](https://sanity.io) v5 via `next-sanity` (Sanity's official add-on for connecting Sanity to a Next.js site) and rich text rendered with `@portabletext/react` (library that turns that data into real HTML as Sanity doesn't store rich text as HTML) |
| Styling                     | CSS in `src/styles/globals.css`. Tailwind CSS 3 is installed but only its base reset is used (config in `tailwind.config.ts`)                                                                                                                                 |
| Fonts                       | Libre Caslon Display (headings, teaser) + Inter (body), self-hosted via `next/font`: downloaded at build time, so visitors never contact Google                                                                                                               |
| Teaser animation            | Canvas 2D + [Matter.js](https://brm.io/matter-js/) physics                                                                                                                                                                                                    |
| i18n (internationalization) | `[lang]` route segment + `src/proxy.ts` for locale redirects, every page lives once under [lang], the language is always the first part of the URL, and proxy.ts adds the language to the URL when a link leaves it out                                       |


---

## Project structure

```
src/
├── proxy.ts                    # locale redirect (runs before each request)
├── app/
│   ├── [lang]/
│   │   ├── layout.tsx          # root layout: <html lang>, fonts, CSS, header, nav, footer; 404 for unknown languages
│   │   ├── page.tsx            # HOME: teaser + description
│   │   ├── the-project/        # contentPage "the-project"
│   │   ├── kai/                # contentPage "kai"
│   │   ├── team/               # team members + institutions
│   │   ├── news/               # post list + news/[slug] detail page
│   │   └── impressum/          # imprint (hardcoded, not in Sanity)
│   ├── robots.ts               # /robots.txt: blocks AI crawlers, hides /studio
│   └── studio/
│       ├── layout.tsx          # separate root layout for the Studio (no site CSS/chrome)
│       └── [[...tool]]/        # embedded Sanity Studio
├── components/
│   ├── Teaser.tsx              # falling-text physics animation (client component)
│   ├── ContentPage.tsx         # shared layout for The Project, K.ai
│   ├── CardGrid.tsx            # staggered 3-column card grid (News, Team)
│   ├── BackToTop.tsx           # back-to-top arrow
│   └── Navigation.tsx          # nav links, active state, mobile hamburger
├── lib/
│   ├── content.ts              # getContent(), types, locale helpers, navItems
│   ├── image.ts                # Sanity image URLs (crop/hotspot) for next/image
│   └── sanity.ts               # Sanity client
├── sanity/
│   ├── env.ts                  # reads + checks the NEXT_PUBLIC_SANITY_* variables
│   ├── sanity.config.ts        # Studio config + sidebar structure
│   ├── socialPlatforms.ts      # platforms offered for "Social media" links
│   └── schemas/                # siteSettings, contentPage, newsPost, teamMember, institution;
│                               #   links.ts: Links/Social media fields shared by both
└── styles/globals.css          # most of the styling
public/                         # favicons, web manifest
docs/sanity-integration.md      # step-by-step guide to how Sanity was set up
eslint.config.mjs               # lint rules (Next.js recommended + TypeScript)
```

