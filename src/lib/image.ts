// Builds Sanity CDN URLs for images, applying the crop and focal point
// ("hotspot") set in the Studio. The URL is then passed to next/image, which
// resizes the image and serves it from this site (see next.config.ts), so
// visitors' browsers don't contact Sanity's CDN directly.
import { createImageUrlBuilder } from '@sanity/image-url';
import type { Image } from './content';
import { dataset, projectId } from '@/sanity/env';

const builder = createImageUrlBuilder({ projectId, dataset });

// Cropped to the given aspect ratio around the hotspot, at a generous source
// width; next/image scales it down per screen size.
export function croppedImageUrl(image: Image, aspect: number, width = 1200): string {
  return builder.image(image.source).width(width).height(Math.round(width / aspect)).fit('crop').url();
}

// Uncropped (e.g. logos), limited to the given width (never enlarged).
export function imageUrl(image: Image, width = 1200): string {
  return builder.image(image.source).width(width).fit('max').url();
}
