import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';   // note: not 'sanity/plugins/structure'
import { schemaTypes } from './schemas';

export default defineConfig({
  name: 'kaspar-studio',
  title: 'Kaspar 2028',
  // Tells the Studio where it's hosted so internal navigation URLs are correct.
  // Without this, Studio tries to treat the "studio" path segment as a tool name.
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