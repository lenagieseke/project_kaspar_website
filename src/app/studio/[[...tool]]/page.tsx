import { NextStudio } from 'next-sanity/studio';
import config from '@/sanity/sanity.config';

// The Studio is a client-side app, so its HTML shell can be served as a static
// file instead of being rendered on every request (next-sanity's recommended
// setup). Its viewport settings (e.g. no zoom-on-focus on phones) come from
// next-sanity too.
export const dynamic = 'force-static';
export { viewport } from 'next-sanity/studio';

// [[...tool]] is a Next.js catch-all route. next-sanity needs it to handle
// all the Studio's internal navigation (e.g. /studio/structure/newsPost/abc123).
export default function StudioPage() {
  return <NextStudio config={config} />;
}
