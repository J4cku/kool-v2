import Image from 'next/image';

interface ParallaxImageProps {
  src: string;
  alt: string;
  aspect?: string;
  sizes?: string;
  quality?: number;
}

/* Full-width image, static: the photo fills its frame exactly (frame and
   delivered assets share the 16:9 aspect), so nothing is cropped. The
   earlier parallax drift was dropped — it required overscan that cut into
   the designer's framing. */
export default function ParallaxImage({ src, alt, aspect = 'aspect-video', sizes = '100vw', quality }: ParallaxImageProps) {
  return (
    <div className={`relative w-full ${aspect} overflow-hidden`}>
      <Image src={src} alt={alt} fill className="object-cover" sizes={sizes} quality={quality} />
    </div>
  );
}
