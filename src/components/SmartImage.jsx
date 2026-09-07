const WIDTHS = [400, 600, 800, 1200, 1600];

/**
 * The catalog images are Unsplash URLs carrying a `w=` query param, so the
 * browser can be handed a real srcset instead of always downloading the
 * 800–1600px original. Falls back to a plain <img> for anything else.
 */
function buildSrcSet(src) {
  if (!src || !src.includes('images.unsplash.com')) return undefined;
  try {
    const url = new URL(src);
    return WIDTHS.map((w) => {
      url.searchParams.set('w', String(w));
      return `${url.toString()} ${w}w`;
    }).join(', ');
  } catch {
    return undefined;
  }
}

export default function SmartImage({
  src,
  alt,
  sizes = '(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw',
  priority = false,
  className = '',
  ...rest
}) {
  return (
    <img
      src={src}
      srcSet={buildSrcSet(src)}
      sizes={sizes}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      className={className}
      {...rest}
    />
  );
}
