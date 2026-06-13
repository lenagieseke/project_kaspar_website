import { defineField, defineType } from 'sanity';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',

  fields: [
    defineField({
      name: 'homeDescription_en',
      title: 'Home Description (English)',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'homeDescription_de',
      title: 'Home Description (German)',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'teaserText_en',
      title: 'Teaser Animation Text (English)',
      description: 'Text broken into falling words/phrases in the home page animation.',
      type: 'text',
      rows: 5,
    }),
    defineField({
      name: 'teaserText_de',
      title: 'Teaser Animation Text (German)',
      description: 'Text für die fallende Wörter-Animation auf der Startseite.',
      type: 'text',
      rows: 5,
    }),
  ],

  // Fixed title so the document preview never tries to render a text blob.
  preview: {
    prepare() {
      return { title: 'Site Settings' };
    },
  },
});