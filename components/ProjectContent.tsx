'use client';

import Image from 'next/image';
import BeforeAfterSlider from './BeforeAfterSlider';
import ColumnImage from './ColumnImage';

type SliderData = { beforeSrc: string; afterSrc: string; labels?: [string, string] };
type Item =
  | { kind: 'image'; src: string }
  | { kind: 'reel'; src: string }
  | ({ kind: 'slider' } & SliderData);

interface ProjectContentProps {
  images: string[];
  description: string;
  descriptionBlocks?: string[];
  fullWidthIndices?: number[];
  containedPairs?: { indices: [number, number]; labels?: [string, string]; scale?: number; aspect?: string }[];
  reverseLastRow?: boolean;
  reel?: { src: string; index: number };
  // Half-width before/after slider occupying a single gallery slot; index
  // shares the same display-slot space as reel/fullWidthIndices
  slider?: SliderData & { index: number };
  textRows?: { row: number; side: 'left' | 'right' }[];
  flipRowParity?: boolean;
  portraitIndices?: number[];
  // Padded images rendered noticeably smaller (top-aligned, capped width);
  // for technical drawings/axonometries that shouldn't fill the slot
  smallIndices?: number[];
}

function PaddedImage({ src, small }: { src: string; small?: boolean }) {
  if (small) {
    return (
      <ColumnImage
        src={src}
        alt="Kool Studio project"
        aspect="aspect-[9/16]"
        width="w-[72%] md:w-[60%]"
        fit="contain"
        className="w-full md:w-1/2 p-6 md:p-10 lg:p-14 xl:p-20"
        sizes="(max-width: 768px) 72vw, 30vw"
      />
    );
  }
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

function ReelVideo({ src }: { src: string }) {
  return (
    <div className="w-full md:w-1/2 p-6 md:p-10 lg:p-14 xl:p-20 flex items-center">
      <video
        src={src}
        autoPlay
        muted
        loop
        playsInline
        aria-label="Kool Studio project video"
        className="mx-auto w-full max-w-[360px] aspect-[9/16] object-cover"
      />
    </div>
  );
}

function SliderCell({ item }: { item: SliderData }) {
  return (
    <div className="w-full md:w-1/2">
      <BeforeAfterSlider
        beforeSrc={item.beforeSrc}
        afterSrc={item.afterSrc}
        beforeLabel={item.labels?.[0]}
        afterLabel={item.labels?.[1]}
        aspectClass="aspect-[2/3]"
      />
    </div>
  );
}

function FullSlot({ item, portrait }: { item: Item; portrait?: boolean }) {
  if (item.kind === 'slider') return <SliderCell item={item} />;
  return item.kind === 'image' ? <FullImage src={item.src} portrait={portrait} /> : <ReelVideo src={item.src} />;
}

function PaddedSlot({ item, small }: { item: Item; small?: boolean }) {
  if (item.kind === 'slider') return <SliderCell item={item} />;
  return item.kind === 'image' ? <PaddedImage src={item.src} small={small} /> : <ReelVideo src={item.src} />;
}

function TextBlock({ text, align = 'end' }: { text: string; align?: 'start' | 'end' }) {
  return (
    <div className="w-full md:w-1/2 p-6 md:p-10 lg:p-14 xl:p-20">
      <div className={`flex h-full ${align === 'start' ? 'items-start' : 'items-end'}`}>
        <p className="font-[400] text-[13px] md:text-[14px] leading-[1.7] text-dark text-justify whitespace-pre-line">
          {text}
        </p>
      </div>
    </div>
  );
}

export default function ProjectContent({ images, description, descriptionBlocks, fullWidthIndices, containedPairs, reverseLastRow, reel, slider, textRows, flipRowParity, portraitIndices, smallIndices }: ProjectContentProps) {
  if (images.length === 0) return null;

  const texts = descriptionBlocks ?? [description];
  const fullWidthSet = new Set(fullWidthIndices ?? []);
  const portraitSet = new Set(portraitIndices ?? []);
  const smallSet = new Set(smallIndices ?? []);
  const containedMap = new Map<number, { otherIdx: number; labels?: [string, string]; scale?: number; aspect?: string; isFirst: boolean }>();
  for (const pair of containedPairs ?? []) {
    containedMap.set(pair.indices[0], { otherIdx: pair.indices[1], labels: pair.labels, scale: pair.scale, aspect: pair.aspect, isFirst: true });
    containedMap.set(pair.indices[1], { otherIdx: pair.indices[0], labels: pair.labels, scale: pair.scale, aspect: pair.aspect, isFirst: false });
  }
  const textRowMap = new Map((textRows ?? []).map((r) => [r.row, r.side]));

  const items: Item[] = images.map((src) => ({ kind: 'image', src }));
  // Insert reel/slider items by ascending display index (each index is
  // measured in the final array, so inserting low-to-high keeps them aligned)
  const inserts: { index: number; item: Item }[] = [];
  if (reel) inserts.push({ index: reel.index, item: { kind: 'reel', src: reel.src } });
  if (slider) inserts.push({ index: slider.index, item: { kind: 'slider', beforeSrc: slider.beforeSrc, afterSrc: slider.afterSrc, labels: slider.labels } });
  inserts.sort((a, b) => a.index - b.index);
  for (const ins of inserts) {
    items.splice(Math.min(Math.max(ins.index, 0), items.length), 0, ins.item);
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
        <div
          key={`row-${rowIdx}`}
          className={pairInfo.scale ? 'mx-auto w-full' : undefined}
          style={pairInfo.scale ? { maxWidth: `${pairInfo.scale * 100}%` } : undefined}
        >
          <BeforeAfterSlider
            beforeSrc={current.src}
            afterSrc={next.src}
            beforeLabel={labels?.[0]}
            afterLabel={labels?.[1]}
            aspectClass={pairInfo.aspect}
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
      const si = itemIdx++;
      const slot = <FullSlot key={`f-${si}`} portrait={portraitSet.has(si)} item={items[si]} />;
      const text = <TextBlock key={`t-${textIdx}`} text={texts[textIdx++]} align={textAlign} />;
      left = textOnRight ? slot : text;
      right = textOnRight ? text : slot;
    } else if (fullLeft) {
      const li = itemIdx++;
      left = <FullSlot key={`f-${li}`} portrait={portraitSet.has(li)} item={items[li]} />;
      if (itemIdx < items.length) {
        const ri = itemIdx++;
        right = <PaddedSlot key={`p-${ri}`} small={smallSet.has(ri)} item={items[ri]} />;
      } else {
        right = null;
      }
    } else {
      const li = itemIdx++;
      left = <PaddedSlot key={`p-${li}`} small={smallSet.has(li)} item={items[li]} />;
      if (itemIdx < items.length) {
        const ri = itemIdx++;
        right = <FullSlot key={`f-${ri}`} portrait={portraitSet.has(ri)} item={items[ri]} />;
      } else {
        right = null;
      }
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
