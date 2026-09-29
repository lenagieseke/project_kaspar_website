import { defineField, defineType } from 'sanity';
import { linksField, socialsField } from './links';

// Partner and funding institutions (e.g. Residenztheater, Filmuniversität,
// Kulturstiftung des Bundes), shown in their own section on the Team page.
export const institution = defineType({
  name: 'institution',
  title: 'Institution',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      description:
        'Optional. Shown above the name at the full width of the card (about 800px wide on high-resolution screens), so upload it at least that wide. PNG with a transparent background works best.',
      // No SVG: next/image doesn't process SVGs, so they would be loaded
      // straight from Sanity's CDN instead of this site (see lib/image.ts).
      options: { accept: 'image/png, image/jpeg, image/webp' },
    }),
    defineField({ name: 'description_en', title: 'Description (EN)', type: 'text', rows: 4 }),
    defineField({ name: 'description_de', title: 'Description (DE)', type: 'text', rows: 4 }),
    linksField('Optional, e.g. website or a project page. The label is the link text on the page.'),
    socialsField,
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Position on the Team page (lowest first).',
    }),
  ],
  orderings: [{ title: 'Page order', name: 'order', by: [{ field: 'order', direction: 'asc' }, { field: 'name', direction: 'asc' }] }],
  preview: { select: { title: 'name', media: 'logo' } },
});
