// Sanity connection settings, read from environment variables.
// Locally they come from .env.local; on Render from the service's
// Environment tab. Each variable must be written out literally
// (process.env.NEXT_PUBLIC_…) so Next.js can inline it into the browser
// bundle used by the Studio.

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. ` +
        `Set it in .env.local (local) or in the Render dashboard under Environment (deploy).`
    );
  }
  return value;
}

export const projectId = required(
  'NEXT_PUBLIC_SANITY_PROJECT_ID',
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
);

export const dataset = required(
  'NEXT_PUBLIC_SANITY_DATASET',
  process.env.NEXT_PUBLIC_SANITY_DATASET
);
