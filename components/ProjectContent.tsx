'use client';

import Image from 'next/image';

interface ProjectContentProps {
  images: string[];
  description: string;
  descriptionBlocks?: string[];
}

function PaddedImage({ src }: { src: string }) {
  return (
    <div className="w-full md:w-1/2 p-6 md:p-10 lg:p-14 xl:p-20">
      <div className="relative w-full h-full aspect-[3/4] md:aspect-auto">
        <Image src={src} alt="" fill className="object-contain" sizes="(max-width: 768px) 100vw, 40vw" />
      </div>
    </div>
  );
}

function FullImage({ src }: { src: string }) {
  return (
    <div className="w-full md:w-1/2 aspect-square relative">
      <Image src={src} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
    </div>
  );
}

function TextBlock({ text, align = 'end' }: { text: string; align?: 'start' | 'end' }) {
  return (
    <div className="w-full md:w-1/2 p-6 md:p-10 lg:p-14 xl:p-20">
      <div className={`flex h-full ${align === 'start' ? 'items-start' : 'items-end'}`}>
        <p className="font-[300] text-[15px] md:text-[16px] leading-[1.7] text-dark text-justify">
          {text}
        </p>
      </div>
    </div>
  );
}

export default function ProjectContent({ images, description, descriptionBlocks }: ProjectContentProps) {
  if (images.length === 0) return null;

  const texts = descriptionBlocks ?? [description];
  const rows: React.ReactNode[] = [];
  let imgIdx = 0;
  let textIdx = 0;
  let rowIdx = 0;

  const textAligns: ('end' | 'start')[] = ['end', 'start', 'end'];

  while (imgIdx < images.length) {
    const fullLeft = rowIdx % 2 === 0;
    const isTextRow = rowIdx % 3 === 0 && textIdx < texts.length;
    const textAlign = textAligns[textIdx % textAligns.length];

    let left: React.ReactNode;
    let right: React.ReactNode;

    if (fullLeft) {
      left = <FullImage key={`f-${imgIdx}`} src={images[imgIdx]} />;
      imgIdx++;
      right = isTextRow
        ? <TextBlock key={`t-${textIdx}`} text={texts[textIdx++]} align={textAlign} />
        : imgIdx < images.length
          ? <PaddedImage key={`p-${imgIdx}`} src={images[imgIdx++]} />
          : null;
    } else {
      left = isTextRow
        ? <TextBlock key={`t-${textIdx}`} text={texts[textIdx++]} align={textAlign} />
        : <PaddedImage key={`p-${imgIdx}`} src={images[imgIdx++]} />;
      right = imgIdx < images.length
        ? <FullImage key={`f-${imgIdx}`} src={images[imgIdx++]} />
        : null;
    }

    rows.push(
      <div key={`row-${rowIdx}`} className="flex flex-col md:flex-row">
        {left}
        {right}
      </div>
    );

    rowIdx++;
  }

  return (
    <div className="flex flex-col gap-10">
      {rows}
      <div className="h-16 md:h-24" />
    </div>
  );
}
