// "Links" and "Social media" fields, shared by team members and institutions.
// Both are optional lists with any number of entries.
import { defineArrayMember, defineField } from 'sanity';
import { SOCIAL_PLATFORMS } from '../socialPlatforms';

// Only web and mail links; blocks e.g. javascript: URLs.
const urlField = defineField({
  name: 'url',
  title: 'URL',
  type: 'url',
  validation: (Rule) => Rule.required().uri({ scheme: ['https', 'http', 'mailto'] }),
});

export function linksField(description: string) {
  return defineField({
    name: 'links',
    title: 'Links',
    description,
    type: 'array',
    of: [
      defineArrayMember({
        type: 'object',
        name: 'link',
        fields: [
          defineField({ name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required() }),
          urlField,
        ],
        preview: { select: { title: 'label', subtitle: 'url' } },
      }),
    ],
  });
}

export const socialsField = defineField({
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
        urlField,
      ],
      preview: { select: { title: 'platform', subtitle: 'url' } },
    }),
  ],
});
