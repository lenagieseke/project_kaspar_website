import { defineField, defineType } from 'sanity';
import { linksField, socialsField } from './links';

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
    linksField('Optional, e.g. personal website or portfolio.'),
    socialsField,
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
