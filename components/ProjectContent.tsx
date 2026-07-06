'use client';

import Image from 'next/image';
import BeforeAfterSlider from './BeforeAfterSlider';

type Item = { kind: 'image'; src: string } | { kind: 'reel'; url: string };

interface ProjectContentProps {
  images: string[];
  description: string;
  descriptionBlocks?: string[];
  fullWidthIndices?: number[];
  containedPairs?: { indices: [number, number]; labels?: [string, string] }[];
  reverseLastRow?: boolean;
  reel?: { url: string; index: number };
  textRows?: { row: number; side: 'left' | 'right' }[];
  flipRowParity?: boolean;
  portraitIndices?: number[];
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

function FullImage({ src, portrait }: { src: string; portrait?: boolean }) {
  return (
    <div className={`w-full md:w-1/2 ${portrait ? 'aspect-[2/3]' : 'aspect-square'} relative`}>
      <Image src={src} alt="Kool Studio project" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" quality={90} />
    </div>
  );
}

function ReelEmbed({ url }: { url: string }) {
  return (
    <div className="w-full md:w-1/2 p-6 md:p-10 lg:p-14 xl:p-20 flex items-center">
      <div className="mx-auto w-full max-w-[360px]">
        <iframe
          src={`${url}embed/`}
          className="w-full aspect-[9/16] border-0"
          allowFullScreen
          loading="lazy"
          title="Kool Studio - Instagram"
        />
      </div>
    </div>
  );
}

function FullSlot({ item, portrait }: { item: Item; portrait?: boolean }) {
  return item.kind === 'image' ? <FullImage src={item.src} portrait={portrait} /> : <ReelEmbed url={item.url} />;
}

function PaddedSlot({ item }: { item: Item }) {
  return item.kind === 'image' ? <PaddedImage src={item.src} /> : <ReelEmbed url={item.url} />;
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

export default function ProjectContent({ images, description, descriptionBlocks, fullWidthIndices, containedPairs, reverseLastRow, reel, textRows, flipRowParity, portraitIndices }: ProjectContentProps) {
  if (images.length === 0) return null;

  const texts = descriptionBlocks ?? [description];
  const fullWidthSet = new Set(fullWidthIndices ?? []);
  const portraitSet = new Set(portraitIndices ?? []);
  const containedMap = new Map<number, { otherIdx: number; labels?: [string, string]; isFirst: boolean }>();
  for (const pair of containedPairs ?? []) {
    containedMap.set(pair.indices[0], { otherIdx: pair.indices[1], labels: pair.labels, isFirst: true });
    containedMap.set(pair.indices[1], { otherIdx: pair.indices[0], labels: pair.labels, isFirst: false });
  }
  const textRowMap = new Map((textRows ?? []).map((r) => [r.row, r.side]));

  const items: Item[] = images.map((src) => ({ kind: 'image', src }));
  if (reel) {
    items.splice(Math.min(Math.max(reel.index, 0), items.length), 0, { kind: 'reel', url: reel.url });
  }

  const rows: React.ReactNode[] = [];
  let itemIdx = 0;
  let textIdx = 0;
  let rowIdx = 0;

  const textAligns: ('end' | 'start')[] = ['end', 'start', 'end'];

  while (itemIdx < items.length) {
    const current = items[itemIdx];

    // Full-width row
    if (fullWidthSet.has(itemIdx) && current.kind === 'image') {
      rows.push(
        <div key={`row-${rowIdx}`} className="w-full relative aspect-video">
          <Image src={current.src} alt="Kool Studio project" fill className="object-cover" sizes="100vw" quality={90} />
        </div>
      );
      itemIdx++;
      rowIdx++;
      continue;
    }

    // Before/after slider row
    const pairInfo = containedMap.get(itemIdx);
    const next = items[itemIdx + 1];
    if (pairInfo?.isFirst && containedMap.has(itemIdx + 1) && current.kind === 'image' && next?.kind === 'image') {
      const labels = pairInfo.labels;
      rows.push(
        <div key={`row-${rowIdx}`}>
          <BeforeAfterSlider
            beforeSrc={current.src}
            afterSrc={next.src}
            beforeLabel={labels?.[0]}
            afterLabel={labels?.[1]}
          />
        </div>
      );
      itemIdx += 2;
      rowIdx++;
      continue;
    }

    // Check if this is the last 50/50 row and should be reversed
    const remainingItems = items.length - itemIdx;
    const remainingFullWidth = Array.from(fullWidthSet).filter(i => i >= itemIdx).length;
    const isLastPair = remainingItems - remainingFullWidth === 2 && !fullWidthSet.has(itemIdx);
    const shouldReverse = reverseLastRow && isLastPair;

    const parityBase = flipRowParity ? 1 : 0;
    const fullLeft = shouldReverse ? !(rowIdx % 2 === parityBase) : (rowIdx % 2 === parityBase);
    const textSide = textRowMap.get(rowIdx);
    const isTextRow = (textRows ? textSide !== undefined : rowIdx % 3 === 0) && textIdx < texts.length;
    const textOnRight = isTextRow && (textRows ? textSide === 'right' : fullLeft);
    const textAlign = textAligns[textIdx % textAligns.length];

    let left: React.ReactNode;
    let right: React.ReactNode;

    if (isTextRow) {
      const slot = <FullSlot key={`f-${itemIdx}`} portrait={portraitSet.has(itemIdx)} item={items[itemIdx++]} />;
      const text = <TextBlock key={`t-${textIdx}`} text={texts[textIdx++]} align={textAlign} />;
      left = textOnRight ? slot : text;
      right = textOnRight ? text : slot;
    } else if (fullLeft) {
      left = <FullSlot key={`f-${itemIdx}`} portrait={portraitSet.has(itemIdx)} item={items[itemIdx++]} />;
      right = itemIdx < items.length
        ? <PaddedSlot key={`p-${itemIdx}`} item={items[itemIdx++]} />
        : null;
    } else {
      left = <PaddedSlot key={`p-${itemIdx}`} item={items[itemIdx++]} />;
      right = itemIdx < items.length
        ? <FullSlot key={`f-${itemIdx}`} portrait={portraitSet.has(itemIdx)} item={items[itemIdx++]} />
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
