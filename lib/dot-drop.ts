/* The idle dot drop's shared model — the bounce the navbar animates, and the
   landing signal it emits so the footer hairline can react to being struck.
   Deliberately not in lib/analytics.ts — nothing here is captured — but the
   event follows the same window-event + paired-unsubscriber idiom (see
   openCookieSettings there). Dispatching with no listener attached is inert
   and expected.
   Design: docs/superpowers/specs/2026-07-24-idle-dot-drop-design.md */

export type DotImpact = {
  /* Impact point in viewport pixels — the dot's horizontal centre. */
  x: number;
  /* Normalised 0–1 force of this particular bounce. */
  strength: number;
};

const DOT_IMPACT_EVENT = 'kool:dot-impact';

export function emitDotImpact(detail: DotImpact) {
  window.dispatchEvent(new CustomEvent<DotImpact>(DOT_IMPACT_EVENT, { detail }));
}

export function onDotImpact(callback: (detail: DotImpact) => void): () => void {
  const handler = (event: Event) => callback((event as CustomEvent<DotImpact>).detail);
  window.addEventListener(DOT_IMPACT_EVENT, handler);
  return () => window.removeEventListener(DOT_IMPACT_EVENT, handler);
}

/* --- The bounce --------------------------------------------------------- */

/* Everything below hangs off one restitution constant. Falling `distance` px
   in FALL_DURATION fixes gravity (g = 2d/t²) and the speed at the line
   (v = g·t); every contact returns RESTITUTION of the speed it arrived with,
   and that one number then decides both the height of the next hop (v²/2g)
   and how long it lasts (2v/g). Neither can be tuned without the other, and
   it is that mutual agreement — rather than the individual values — that the
   eye reads as real. */
const FALL_DURATION = 0.38;
const RESTITUTION = 0.55;
/* Below this a hop is a scuff rather than a bounce: the dot stays down. */
const MIN_AIRTIME = 0.03;
/* Deformation at full impact speed. Each contact takes its own share of these
   from the speed it arrives with, so the first hit deforms hardest and the
   last taps barely deform at all. */
const STRETCH = 0.12;
const SQUASH = 0.18;
/* Seconds spent deforming, scaled by speed for the same reason — a light tap
   is also a brief one. The floor keeps the late micro-contacts from
   collapsing to zero width. */
const CONTACT = 0.045;
const MIN_CONTACT = 0.01;

export type DotFlight = {
  /* Seconds from release to lying still on the line. */
  duration: number;
  /* 0 at release, exactly 1 at every contact, and below 1 along a true
     parabola in between. Handed to framer-motion as a custom `ease` so the
     whole flight is one tween: y = distance * ease(progress). Framer does not
     clamp easing output, so the non-monotonic curve is exactly right. */
  ease: (progress: number) => number;
  /* Squash and stretch, as 0–1 offsets of `duration`. Sampled at the moments
     the physics puts them — contact, release, apex — not on a fixed grid. */
  times: number[];
  scaleX: number[];
  scaleY: number[];
  /* One per contact with the line, in seconds from release. */
  impacts: { time: number; strength: number }[];
};

export function planDotFlight(distance: number): DotFlight {
  const gravity = (2 * distance) / FALL_DURATION ** 2;
  const impactSpeed = gravity * FALL_DURATION;

  const contacts: {
    time: number;
    /* Speed arriving at the line, and the speed it leaves with. */
    speed: number;
    rebound: number;
    /* Both 0 on the contact the dot stays down on. */
    airtime: number;
    apex: number;
  }[] = [];

  for (let time = FALL_DURATION, speed = impactSpeed; ; ) {
    const rebound = speed * RESTITUTION;
    const airtime = (2 * rebound) / gravity;
    const hops = airtime >= MIN_AIRTIME;
    contacts.push({
      time,
      speed,
      rebound: hops ? rebound : 0,
      airtime: hops ? airtime : 0,
      apex: hops ? rebound ** 2 / (2 * gravity) : 0,
    });
    if (!hops) break;
    time += airtime;
    speed = rebound;
  }

  const halfContact = (speed: number) =>
    Math.max(MIN_CONTACT, CONTACT * (speed / impactSpeed)) / 2;
  const settle = contacts[contacts.length - 1];
  const duration = settle.time + halfContact(settle.speed);

  const times: number[] = [0];
  const scaleY: number[] = [1];
  const at = (moment: number, deformation: number) => {
    times.push(moment / duration);
    scaleY.push(deformation);
  };
  /* Stretch follows the speed the dot has at that instant, so it thins as it
     accelerates and is round again at the top of every hop. */
  const stretch = (speed: number) => 1 + (STRETCH * Math.max(0, speed)) / impactSpeed;

  for (const contact of contacts) {
    const half = halfContact(contact.speed);
    at(contact.time - half, stretch(contact.speed - gravity * half));
    at(contact.time, 1 - (SQUASH * contact.speed) / impactSpeed);
    if (contact.airtime === 0) {
      at(contact.time + half, 1);
      break;
    }
    at(contact.time + half, stretch(contact.rebound - gravity * half));
    at(contact.time + contact.airtime / 2, 1);
  }

  return {
    duration,
    times,
    scaleY,
    /* Area-preserving: the dot is a flat mark, not a sphere, so the silhouette
       the eye judges is its area. 1/sqrt() would preserve the volume of a 3D
       ball and cost this dot ~9% of its area at the hardest squash — it would
       read as shrinking on impact rather than deforming. */
    scaleX: scaleY.map((deformation) => 1 / deformation),
    impacts: contacts.map((contact) => ({
      time: contact.time,
      strength: contact.speed / impactSpeed,
    })),
    ease: (progress: number) => {
      const elapsed = progress * duration;
      if (elapsed <= FALL_DURATION) {
        // ½gt², normalised by the distance it covers
        const fallen = elapsed / FALL_DURATION;
        return fallen * fallen;
      }
      for (const contact of contacts) {
        if (elapsed >= contact.time + contact.airtime) continue;
        const hop = (elapsed - contact.time) / contact.airtime;
        // Parabola touching 1 at both ends, apex/distance up in the middle
        return 1 - ((4 * contact.apex) / distance) * hop * (1 - hop);
      }
      return 1;
    },
  };
}
