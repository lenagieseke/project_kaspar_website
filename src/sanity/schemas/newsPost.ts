import { defineField, defineType } from 'sanity';

export const newsPost = defineType({
  name: 'newsPost',
  title: 'News Post',
  type: 'document',
  fields: [
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      // Auto-generates the URL slug from the English title.
      // Editors can also edit it manually before publishing.
      options: { source: 'title_en', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'title_en', title: 'Title (EN)', type: 'string' }),
    defineField({ name: 'title_de', title: 'Title (DE)', type: 'string' }),
    defineField({ name: 'date',     title: 'Date',       type: 'datetime' }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'News',     value: 'news' },
          { title: 'Article',  value: 'article' },
          { title: 'Tutorial', value: 'tutorial' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({ name: 'body_en', title: 'Body (EN)', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'body_de', title: 'Body (DE)', type: 'array', of: [{ type: 'block' }] }),
  ],
  orderings: [
    {
      title: 'Date, newest first',
      name: 'dateDesc',
      by: [{ field: 'date', direction: 'desc' }],
    },
  ],
  preview: {
    select: { title: 'title_en', subtitle: 'date' },
  },
});