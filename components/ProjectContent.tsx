'use client';

import Image from 'next/image';

interface ProjectContentProps {
  images: string[];
  description: string;
  descriptionBlocks?: string[];
  fullWidthIndices?: number[];
  containedPairs?: { indices: [number, number]; labels?: [string, string] }[];
  reverseLastRow?: boolean;
}

function PaddedImage({ src }: { src: string }) {
  return (
    <div className="w-full md:w-1/2 p-6 md:p-10 lg:p-14 xl:p-20">
      <div className="relative w-full h-full aspect-[3/4] md:aspect-auto">
        <Image src={src} alt="Kool Studio project" fill className="object-contain" sizes="(max-width: 768px) 100vw, 40vw" />
      </div>
    </div>
  );
}

function FullImage({ src }: { src: string }) {
  return (
    <div className="w-full md:w-1/2 aspect-square relative">
      <Image src={src} alt="Kool Studio project" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
    </div>
  );
}

function ContainedImage({ src, label }: { src: string; label?: string }) {
  return (
    <div className="w-full md:w-1/2">
      {label && (
        <p className="text-[13px] font-[500] text-dark mb-2 md:ml-20">{label}</p>
      )}
      <div className="aspect-[3/2] relative">
        <Image src={src} alt="Kool Studio project" fill className="object-contain object-left-top" sizes="(max-width: 768px) 100vw, 50vw" />
      </div>
    </div>
  );
}

function TextBlock({ text, align = 'end' }: { text: string; align?: 'start' | 'end' }) {
  return (
    <div className="w-full md:w-1/2 p-6 md:p-10 lg:p-14 xl:p-20">
      <div className={`flex h-full ${align === 'start' ? 'items-start' : 'items-end'}`}>
        <p className="font-[300] text-[13px] md:text-[14px] leading-[1.7] text-dark text-justify">
          {text}
        </p>
      </div>
    </div>
  );
}

export default function ProjectContent({ images, description, descriptionBlocks, fullWidthIndices, containedPairs, reverseLastRow }: ProjectContentProps) {
  if (images.length === 0) return null;

  const texts = descriptionBlocks ?? [description];
  const fullWidthSet = new Set(fullWidthIndices ?? []);
  const containedMap = new Map<number, { otherIdx: number; labels?: [string, string]; isFirst: boolean }>();
  for (const pair of containedPairs ?? []) {
    containedMap.set(pair.indices[0], { otherIdx: pair.indices[1], labels: pair.labels, isFirst: true });
    containedMap.set(pair.indices[1], { otherIdx: pair.indices[0], labels: pair.labels, isFirst: false });
  }
  const rows: React.ReactNode[] = [];
  let imgIdx = 0;
  let textIdx = 0;
  let rowIdx = 0;

  const textAligns: ('end' | 'start')[] = ['end', 'start', 'end'];

  while (imgIdx < images.length) {
    // Full-width row
    if (fullWidthSet.has(imgIdx)) {
      rows.push(
        <div key={`row-${rowIdx}`} className="w-full relative aspect-video">
          <Image src={images[imgIdx]} alt="Kool Studio project" fill className="object-cover" sizes="100vw" />
        </div>
      );
      imgIdx++;
      rowIdx++;
      continue;
    }

    // Both-contained row
    const pairInfo = containedMap.get(imgIdx);
    if (pairInfo?.isFirst && imgIdx + 1 < images.length && containedMap.has(imgIdx + 1)) {
      const labels = pairInfo.labels;
      rows.push(
        <div key={`row-${rowIdx}`} className="flex flex-col md:flex-row">
          <ContainedImage key={`c-${imgIdx}`} src={images[imgIdx]} label={labels?.[0]} />
          <ContainedImage key={`c-${imgIdx + 1}`} src={images[imgIdx + 1]} label={labels?.[1]} />
        </div>
      );
      imgIdx += 2;
      rowIdx++;
      continue;
    }

    // Check if this is the last 50/50 row and should be reversed
    const remainingImages = images.length - imgIdx;
    const remainingFullWidth = Array.from(fullWidthSet).filter(i => i >= imgIdx).length;
    const isLastPair = remainingImages - remainingFullWidth === 2 && !fullWidthSet.has(imgIdx);
    const shouldReverse = reverseLastRow && isLastPair;

    const fullLeft = shouldReverse ? !(rowIdx % 2 === 0) : (rowIdx % 2 === 0);
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
