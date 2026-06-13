'use client';

import { NextStudio } from 'next-sanity/studio';
import config from '@/sanity/sanity.config';

// [[...tool]] is a Next.js catch-all route. next-sanity needs it to handle
// all the Studio's internal navigation (e.g. /studio/desk/newsPost/abc123).
export default function StudioPage() {
  return <NextStudio config={config} />;
}