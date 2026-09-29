import { createClient } from 'next-sanity';
import { projectId, dataset } from '@/sanity/env';

export const client = createClient({
  projectId,
  dataset,
  // Pinned API version, so future Sanity API changes can't silently change
  // query results. Only bump it deliberately (and re-test the queries).
  apiVersion: '2024-01-01',
  // Use Sanity's global CDN for read requests in production — faster response
  // times at the cost of up to 60s of eventual consistency.
  useCdn: true,
});