// Shared site constants — safe to import from both server and client modules
export const BASE_URL = 'https://koolstudio.pl';
export const INSTAGRAM_URL = 'https://www.instagram.com/kool.studio/';

/* Meta dataset "KOOL Studio | Website". Hardcoded rather than env-only
   because a pixel id is public by construction — it ships in the page source
   of every visitor, so hiding it in Vercel config buys nothing and costs a
   silently pixel-less production build if the var is ever dropped. The env
   var exists so a preview can point at a scratch dataset, or disable the
   pixel outright with "" — hence ?? and not ||, which would treat the empty
   string as "unset" and re-enable it. */
export const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID ?? '2041137253179699';
