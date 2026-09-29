import { defineField, defineType } from 'sanity';

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
      description: 'Optional. Ideally a dark logo on a transparent background (PNG or SVG). Without a logo, the name is shown.',
    }),
    defineField({ name: 'description_en', title: 'Description (EN)', type: 'text', rows: 4 }),
    defineField({ name: 'description_de', title: 'Description (DE)', type: 'text', rows: 4 }),
    defineField({
      name: 'url',
      title: 'Website',
      type: 'url',
      validation: (Rule) => Rule.uri({ scheme: ['https', 'http'] }),
    }),
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
