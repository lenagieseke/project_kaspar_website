// Post body (Portable Text) with images between paragraphs. Images are shown
// uncropped at the full text width, with an optional caption below
// (styles: .portable-text figure in globals.css).

import Image from 'next/image';
import { PortableText, type PortableTextComponents } from '@portabletext/react';
import type { BodyImage, RichTextBlock } from '@/lib/content';
import { imageUrl } from '@/lib/image';

// The article column is at most 720px wide (.article-body); full width on phones.
const BODY_IMAGE_SIZES = '(max-width: 768px) 100vw, 720px';

const components: PortableTextComponents = {
  types: {
    image: ({ value }: { value: BodyImage }) => {
      const { image, caption } = value;
      return (
        <figure>
          <Image
            src={imageUrl(image)}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes={BODY_IMAGE_SIZES}
            placeholder={image.lqip ? 'blur' : 'empty'}
            blurDataURL={image.lqip}
          />
          {caption && <figcaption>{caption}</figcaption>}
        </figure>
      );
    },
  },
};

export default function RichText({ value }: { value: RichTextBlock[] }) {
  return <PortableText value={value} components={components} />;
}
