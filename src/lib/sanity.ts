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