import { defineField, defineType } from 'sanity';

export const contentPage = defineType({
  name: 'contentPage',
  title: 'Content Page',
  type: 'document',
  fields: [
    defineField({
      name: 'pageId',
      title: 'Page',
      type: 'string',
      options: {
        list: [
          { title: 'The Project', value: 'the-project' },
          { title: 'K.ai',        value: 'kai' },
          { title: 'Team',        value: 'team' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sections',
      title: 'Sections',
      type: 'array',
      // Each section is an inline object (not its own document).
      // Editors can add, remove, and reorder sections in the Studio.
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'heading_en', title: 'Heading (EN)', type: 'string' }),
            defineField({ name: 'heading_de', title: 'Heading (DE)', type: 'string' }),
            defineField({ name: 'body_en', title: 'Body (EN)', type: 'array', of: [{ type: 'block' }] }),
            defineField({ name: 'body_de', title: 'Body (DE)', type: 'array', of: [{ type: 'block' }] }),
          ],
          // Controls what the Studio shows in the collapsed list view
          preview: { select: { title: 'heading_en' } },
        },
      ],
    }),
  ],
  preview: { select: { title: 'pageId' } },
});