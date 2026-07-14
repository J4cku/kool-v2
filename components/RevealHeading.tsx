'use client';

import { motion, useReducedMotion } from 'framer-motion';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const MOTION_TAGS = { h1: motion.h1, h2: motion.h2, h3: motion.h3 } as const;

interface RevealHeadingProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  as?: keyof typeof MOTION_TAGS;
}

/* Display-heading reveal: each word rises out of its own line box with a
   small stagger (newlines in the text are kept as explicit line breaks).
   The heading element itself is observed — the masked word spans sit
   outside their clip boxes and would never intersect on their own.
   Renders a plain heading under prefers-reduced-motion. */
export default function RevealHeading({ text, className = '', style, as = 'h2' }: RevealHeadingProps) {
  const reduceMotion = useReducedMotion();
  const Tag = as;

  if (reduceMotion) {
    return (
      <Tag className={className} style={style}>
        {text}
      </Tag>
    );
  }

  const MotionTag = MOTION_TAGS[as];

  return (
    <MotionTag
      className={className}
      style={style}
      aria-label={text}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.035 } },
      }}
    >
      {text.split('\n').map((line, lineIdx) => (
        <span key={lineIdx} className="block" aria-hidden="true">
          {line
            .split(' ')
            .filter(Boolean)
            .map((word, i, words) => (
              <span key={i} className="inline-block overflow-hidden align-bottom">
                <motion.span
                  className="inline-block"
                  variants={{
                    hidden: { y: '110%' },
                    visible: { y: '0%', transition: { duration: 0.7, ease: EASE } },
                  }}
                >
                  {word}
                  {i < words.length - 1 ? ' ' : ''}
                </motion.span>
              </span>
            ))}
        </span>
      ))}
    </MotionTag>
  );
}
