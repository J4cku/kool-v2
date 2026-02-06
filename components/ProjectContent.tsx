'use client';

import Image from 'next/image';

interface ProjectContentProps {
  images: string[];
  description: string;
}

// Editorial layout blocks that cycle through images
// Each block consumes 1-2 images and returns the next index

function EditorialImageWithText({ src, description }: { src: string; description: string }) {
  return (
    <div className="flex flex-col md:flex-row gap-10 md:gap-0 my-16 md:my-24 px-5 md:px-10 lg:px-12">
      <div className="md:w-[45%]">
        <div className="relative aspect-[4/5]">
          <Image src={src} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 45vw" />
        </div>
      </div>
      <div className="md:w-[55%] flex items-end md:pl-16">
        <p className="font-[300] text-[15px] md:text-[16px] leading-[1.7] text-dark max-w-[480px]">
          {description}
        </p>
      </div>
    </div>
  );
}

function FullBleedImage({ src }: { src: string }) {
  return (
    <div className="relative w-full aspect-[16/9] my-4">
      <Image src={src} alt="" fill className="object-cover" sizes="100vw" />
    </div>
  );
}

function TwoColumnImages({ src1, src2 }: { src1: string; src2: string }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-[3px] my-4">
      <div className="relative aspect-square">
        <Image src={src1} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
      </div>
      <div className="relative aspect-square">
        <Image src={src2} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
      </div>
    </div>
  );
}

function PaddedImage({ src, align }: { src: string; align: 'left' | 'right' }) {
  return (
    <div className={`my-16 md:my-24 px-5 md:px-10 lg:px-12 flex ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
      <div className="w-full md:w-[60%]">
        <div className="relative aspect-[3/4]">
          <Image src={src} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 60vw" />
        </div>
      </div>
    </div>
  );
}

export default function ProjectContent({ images, description }: ProjectContentProps) {
  if (images.length === 0) return null;

  const blocks: React.ReactNode[] = [];
  let i = 0;

  // First block is always image + description
  blocks.push(<EditorialImageWithText key="desc" src={images[0]} description={description} />);
  i = 1;

  // Cycle through remaining images with varied editorial layouts
  let layoutIndex = 0;
  while (i < images.length) {
    const pattern = layoutIndex % 4;

    switch (pattern) {
      case 0:
        // Full bleed
        blocks.push(<FullBleedImage key={`fb-${i}`} src={images[i]} />);
        i += 1;
        break;
      case 1:
        // Two columns (needs 2 images, fall back to padded if only 1 left)
        if (i + 1 < images.length) {
          blocks.push(<TwoColumnImages key={`tc-${i}`} src1={images[i]} src2={images[i + 1]} />);
          i += 2;
        } else {
          blocks.push(<PaddedImage key={`pr-${i}`} src={images[i]} align="right" />);
          i += 1;
        }
        break;
      case 2:
        // Padded right
        blocks.push(<PaddedImage key={`pr-${i}`} src={images[i]} align="right" />);
        i += 1;
        break;
      case 3:
        // Full bleed again
        blocks.push(<FullBleedImage key={`fb2-${i}`} src={images[i]} />);
        i += 1;
        break;
    }

    layoutIndex++;
  }

  return <div>{blocks}</div>;
}
