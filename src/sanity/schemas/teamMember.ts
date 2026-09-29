import { defineArrayMember, defineField, defineType } from 'sanity';

// Bios should be 60–100 words so the cards on the Team page stay similar in
// length. Outside that range the Studio shows a warning (publishing still works).
const BIO_WORDS = { min: 60, max: 100 };

function bioLength(text: string | undefined) {
  if (!text?.trim()) return true;
  const words = text.trim().split(/\s+/).length;
  return words >= BIO_WORDS.min && words <= BIO_WORDS.max
    ? true
    : `${words} words — aim for ${BIO_WORDS.min}–${BIO_WORDS.max}.`;
}

// Only web and mail links; blocks e.g. javascript: URLs.
const linkUrl = (name: string) =>
  defineField({
    name,
    title: 'URL',
    type: 'url',
    validation: (Rule) => Rule.required().uri({ scheme: ['https', 'http', 'mailto'] }),
  });

export const SOCIAL_PLATFORMS = [
  { title: 'Instagram', value: 'instagram' },
  { title: 'LinkedIn', value: 'linkedin' },
  { title: 'Mastodon', value: 'mastodon' },
  { title: 'Bluesky', value: 'bluesky' },
  { title: 'X', value: 'x' },
  { title: 'GitHub', value: 'github' },
  { title: 'Vimeo', value: 'vimeo' },
  { title: 'YouTube', value: 'youtube' },
];

export const teamMember = defineType({
  name: 'teamMember',
  title: 'Team Member',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'role_en',
      title: 'Role (EN)',
      type: 'string',
      description: 'Short title shown above the name, e.g. "Director", "AI Research".',
    }),
    defineField({ name: 'role_de', title: 'Role (DE)', type: 'string' }),
    defineField({
      name: 'projectRole_en',
      title: 'Role in the project (EN)',
      type: 'text',
      rows: 3,
      description: 'One or two sentences on what this person does in Kaspar 2028. Shown before the bio.',
    }),
    defineField({ name: 'projectRole_de', title: 'Role in the project (DE)', type: 'text', rows: 3 }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
      description: 'Shown in portrait format (4:5). Use "Edit" to set the focal point.',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative text',
          type: 'string',
          description: 'Short description for screen readers. Defaults to the name if empty.',
        }),
      ],
    }),
    defineField({
      name: 'bio_en',
      title: 'Bio (EN)',
      description: 'General biography, 60–100 words.',
      type: 'text',
      rows: 5,
      validation: (Rule) => Rule.custom(bioLength).warning(),
    }),
    defineField({
      name: 'bio_de',
      title: 'Bio (DE)',
      type: 'text',
      rows: 5,
      validation: (Rule) => Rule.custom(bioLength).warning(),
    }),
    defineField({
      name: 'links',
      title: 'Links',
      description: 'Optional, e.g. personal website or portfolio.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'link',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required() }),
            linkUrl('url'),
          ],
          preview: { select: { title: 'label', subtitle: 'url' } },
        }),
      ],
    }),
    defineField({
      name: 'socials',
      title: 'Social media',
      description: 'Optional. Enter the full profile URL (e.g. https://instagram.com/name).',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'social',
          fields: [
            defineField({
              name: 'platform',
              title: 'Platform',
              type: 'string',
              options: { list: SOCIAL_PLATFORMS },
              validation: (Rule) => Rule.required(),
            }),
            linkUrl('url'),
          ],
          preview: { select: { title: 'platform', subtitle: 'url' } },
        }),
      ],
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Position on the Team page (lowest first). Members with the same number are sorted by name.',
    }),
  ],
  orderings: [{ title: 'Page order', name: 'order', by: [{ field: 'order', direction: 'asc' }, { field: 'name', direction: 'asc' }] }],
  preview: { select: { title: 'name', subtitle: 'role_en', media: 'photo' } },
});
