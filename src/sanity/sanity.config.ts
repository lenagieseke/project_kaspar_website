'use client';

// Sanity Studio configuration, rendered at /studio (app/studio/[[...tool]]).
// Marked 'use client' because it contains functions (the sidebar structure)
// that can only run in the browser, where the Studio lives.

import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';   // note: not 'sanity/plugins/structure'
import { schemaTypes } from './schemas';
import { projectId, dataset } from './env';

export default defineConfig({
  name: 'kaspar-studio',
  title: 'Kaspar 2028',
  // Tells the Studio where it's hosted so internal navigation URLs are correct.
  // Without this, Studio tries to treat the "studio" path segment as a tool name.
  basePath: '/studio',
  projectId,
  dataset,

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
            S.divider(),
            // Sorted like on the Team page (by the "Order" field, then name).
            S.listItem().title('Team Members').child(
              S.documentTypeList('teamMember').defaultOrdering([
                { field: 'order', direction: 'asc' },
                { field: 'name', direction: 'asc' },
              ])
            ),
            S.listItem().title('Institutions').child(
              S.documentTypeList('institution').defaultOrdering([
                { field: 'order', direction: 'asc' },
                { field: 'name', direction: 'asc' },
              ])
            ),
          ]),
    }),
  ],

  schema: { types: schemaTypes },
});