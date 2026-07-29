'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useRouter } from '@/i18n/navigation';
import { REDUCED_MOTION_QUERY } from '@/hooks/useReducedMotion';
import { track } from '@/lib/analytics';
import CaptionRail from './CaptionRail';
import {
  ACCUMULATE_FRAGMENT_SHADER,
  FEEDBACK_VERTEX_SHADER,
  PRESENT_FRAGMENT_SHADER,
} from './feedback.shaders';
import type { PrzelotItem } from './PrzelotMount';

const SEGMENT_VH = 70;
const DPR_CAP = 1.5;

/* Accumulator resolution is the perf lever: decoupled from the canvas via a
   pixel budget, then scaled by the adaptive quality step. */
const ACCUM_BUDGET_DESKTOP = 2.4e6;
const ACCUM_BUDGET_COARSE = 1.1e6;
const QUALITY_STEPS = [1.0, 0.8, 0.64] as const;
const FRAME_BUDGET_MS = 20;
const UPSHIFT_BUDGET_MS = 17.5;
const DOWNSHIFT_STREAK = 12;
const UPSHIFT_STREAK = 600;
const GRACE_FRAMES = 60;

/* Motion model — all rates per second, converted with the measured dt.
   Z is the radial creep (field traversal), A the shear amplitude; the idle
   pair gives a quarter-turn eye in ~3.3 s, the peak pair a fully wound one. */
const Z_IDLE = 0.2;
const Z_PEAK = 1.25;
const A_IDLE = 0.2;
const A_PEAK = 1.15;
const V_REF = 1.4; // projects/s that saturates the energy
const TAU_ATTACK = 0.08;
const TAU_RELEASE = 1.1;
const TAU_DIR = 0.25;
const TAU_TAIL = 1.8;
const TAU_PLANE = 0.28;
const DT_MIN = 1 / 240;
const DT_MAX = 1 / 30;
const CREEP_CLAMP = 0.08; // per-frame creep above ~8% aliases into blockiness
const INTRO_ENERGY = 0.85;

/* Field shaping. BAND_PHASE solves k/2 + phi = 3*pi/2 so a vorticity zero
   sits on the centre line with a counter-rotating extremum either side. */
const BAND_K = 8.6;
const BAND_PHASE = (3 * Math.PI) / 2 - BAND_K / 2;
const DRIFT = 0.22;
const LUM_BEND = 0.85;
const PLANE_HALF = 0.36;

/* Present pass. Exposure undoes the plane's steady-state veil on the dark
   ground; the beige probe skips it so the ground is not blown toward white. */
const EXPOSURE_DARK = 1.18;
const EXPOSURE_BEIGE = 1.0;
const VIGNETTE_DARK = 0.55;
const VIGNETTE_BEIGE = 0.3;
const GRAIN = 0.02;
const FALLBACK_DITHER = 1 / 255;

/* Artefacts. PRISM is a per-frame radial channel split that compounds down
   the tail into colour fringing; because it accumulates, the useful range is
   tiny — 0.0075 already reads clearly within a second. SMEAR biases the field
   read further along the flow so the tail chases it rather than merely
   decaying. Both idle low and open up with energy, so a resting frame stays
   near-photographic and a fling disintegrates. */
const PRISM_IDLE = 0.0012;
const PRISM_PEAK = 0.0075;
const SMEAR_IDLE = 0.18;
const SMEAR_PEAK = 0.85;

/* Slice tearing lives in the present pass and never feeds back. It is gated
   above the energy the piece sits at while being read, so it appears only on
   a deliberate fling — an artefact you can provoke, not one you endure. */
const GLITCH_ENERGY_GATE = 0.55;
const GLITCH_MAX = 0.34;
const SLICE_COUNT = 28;

/* Contour traces. Not lanes: a gradient probe finds the photograph's own
   silhouettes — chair legs, shelf lips, table edges — and draws along them,
   so the lines are part of the picture rather than a grid laid over it. They
   tremble on a coherent low-frequency displacement, the way a scope trace
   sways on a loose ground.

   SPREAD is in texels and is the single knob that decides which edges count:
   small values pick out fine detail and read as noise on a soft field, large
   values find only major silhouettes. GAIN is the gradient that reads as a
   full-strength edge — lower it to catch more.

   The tint is coral: traces are chrome drawn over the field, the same
   register as the caption pill and the progress hairline, not a colour term
   inside the tunnel. Linear light, i.e. the sRGB token 0xFC3117 decoded. */
const SCOPE_SPREAD = 2.6;
const SCOPE_GAIN = 0.9;
const SCOPE_SHAKE = 0.0022;
const SCOPE_IDLE = 0.55;
const SCOPE_PEAK = 1.1;

/* Chop: on a fling the contours tear off the geometry, blink in and out on a
   stepped clock and harden to aliased lines. Zero below the gate, so at
   reading speed the traces stay faithful outlines. CELLS is how finely the
   outline is diced — too few and whole objects jump as one, too many and it
   degrades into sparkle. BREAK is how far a piece can travel, in uv units. */
const SCOPE_CHOP_GATE = 0.3;
const SCOPE_CHOP_MAX = 1;
const SCOPE_CELLS = 34;
const SCOPE_BREAK = 0.035;
const SCOPE_TINT_CORAL = [0.964, 0.0331, 0.0092] as const;

/* Handoff: the injected plane crossfades over the last 18% of a segment —
   at the source of a 1.8 s integrator, not at the screen, so the outgoing
   project keeps swirling while the incoming one materialises inside it. */
const BLEND_START = 0.8;
const BLEND_END = 0.98;
const PLANE_SWELL = 0.05;
const PREFETCH_FRAC = 0.25;
const KEEP_DISTANCE = 2;

/* Texture streaming. */
const UPLOAD_DEFER_ENERGY = 0.6;
const COARSE_TEXTURE_SIZE = 1024;

/* Warm-up: pre-develop the field before first paint, budgeted per frame so
   the burst cannot become a long task on weak GPUs. */
const WARMUP_STEPS = 24;
const WARMUP_DT = 1 / 60;
const WARMUP_BURST_MS = 8;

const COMMIT_MS = 400;
const COMMIT_PUNCH = 1.5; // Zrate reaches 2.5x at the end of the fade
const CENTER_RADIUS_FRACTION = 0.2;

const GROUND_CSS = { dark: '#1A1A1A', beige: '#E5DDD0' } as const;
type Ground = keyof typeof GROUND_CSS;

/* The ?ground=beige probe as an external-store snapshot (the
   useReducedMotion idiom): this component is server-rendered, so the query
   param must not enter the hydration render. */
const emptySubscribe = () => () => {};
function getGroundSnapshot(): Ground {
  return new URLSearchParams(window.location.search).get('ground') === 'beige' ? 'beige' : 'dark';
}
function getServerGroundSnapshot(): Ground {
  return 'dark';
}

function hexChannels(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function srgbToLinear(byte: number): number {
  const c = byte / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
}

/* In-flight decode dedupe only — never a bitmap cache. At 1440 square each
   ImageBitmap is ~8 MB of host memory; retaining fifteen would be a
   memory-pressure kill on iOS. Entries are removed as soon as they settle,
   and the uploader closes each bitmap right after texSubImage2D. */
const inflight = new Map<string, Promise<ImageBitmap>>();

function decodeBitmap(src: string, resizeTo: number | null): Promise<ImageBitmap> {
  const key = `${src}@${resizeTo ?? 'full'}`;
  let pending = inflight.get(key);
  if (!pending) {
    pending = fetch(src)
      .then((response) => {
        if (!response.ok) throw new Error(`${src}: ${response.status}`);
        return response.blob();
      })
      .then((blob) =>
        resizeTo
          ? createImageBitmap(blob, {
              resizeWidth: resizeTo,
              resizeHeight: resizeTo,
              resizeQuality: 'high',
            })
          : createImageBitmap(blob),
      );
    pending.then(
      () => inflight.delete(key),
      () => inflight.delete(key),
    );
    inflight.set(key, pending);
  }
  return pending;
}

type SlotState = 'fetching' | 'decoded' | 'allocated' | 'uploaded' | 'ready' | 'failed';
type Slot = {
  tex: WebGLTexture | null;
  state: SlotState;
  bitmap: ImageBitmap | null;
  size: number;
};

type AccumUniforms = {
  uAspect: WebGLUniformLocation | null;
  uTime: WebGLUniformLocation | null;
  uCreep: WebGLUniformLocation | null;
  uSwell: WebGLUniformLocation | null;
  uKeep: WebGLUniformLocation | null;
  uSoak: WebGLUniformLocation | null;
  uBlend: WebGLUniformLocation | null;
  uPlaneSwell: WebGLUniformLocation | null;
  uDither: WebGLUniformLocation | null;
  uPrism: WebGLUniformLocation | null;
  uSmear: WebGLUniformLocation | null;
};

type PresentUniforms = {
  uAspect: WebGLUniformLocation | null;
  uTime: WebGLUniformLocation | null;
  uGlitch: WebGLUniformLocation | null;
  uScope: WebGLUniformLocation | null;
  uScopeChopSet: WebGLUniformLocation | null;
};

export default function PrzelotCanvas({
  items,
  onFail,
}: {
  items: PrzelotItem[];
  onFail: () => void;
}) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(0);
  const [fading, setFading] = useState(false);
  const commitRef = useRef<{ started: number } | null>(null);
  const ground = useSyncExternalStore(emptySubscribe, getGroundSnapshot, getServerGroundSnapshot);
  const groundCss = GROUND_CSS[ground];

  const commit = useCallback(
    (slug: string) => {
      if (commitRef.current) return;
      commitRef.current = { started: performance.now() };
      track('przelot_project_opened', { project: slug });
      const href = `/projekty/${slug}`;
      if (window.matchMedia(REDUCED_MOTION_QUERY).matches) {
        router.push(href);
        return;
      }
      setFading(true);
      window.setTimeout(() => router.push(href), COMMIT_MS);
    },
    [router],
  );

  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      const radius = Math.min(rect.width, rect.height) * CENTER_RADIUS_FRACTION;
      if (dx * dx + dy * dy <= radius * radius) {
        commit(items[currentIndexRef.current].slug);
      }
    },
    [commit, items],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    /* The hydration snapshot of useReducedMotion is hardcoded to false, so
       re-check the live preference before paying for a GL context. */
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) {
      onFail();
      return;
    }

    const gl = canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
    });
    if (!gl) {
      onFail();
      return;
    }

    /* Half-float accumulators need this extension to be renderable; without
       it the SRGB8_ALPHA8 fallback (plus write-side dither) takes over. */
    let halfFloat = Boolean(gl.getExtension('EXT_color_buffer_float'));
    const parallel = gl.getExtension('KHR_parallel_shader_compile');

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    gl.disable(gl.SCISSOR_TEST);
    gl.disable(gl.CULL_FACE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);

    const groundBytes = hexChannels(groundCss);
    const groundLinear: [number, number, number] = [
      srgbToLinear(groundBytes[0]),
      srgbToLinear(groundBytes[1]),
      srgbToLinear(groundBytes[2]),
    ];
    /* Paint the default framebuffer once so nothing flashes black while the
       programs link and the first texture streams in. */
    gl.clearColor(groundBytes[0] / 255, groundBytes[1] / 255, groundBytes[2] / 255, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    /* Compile both programs up front; with KHR_parallel_shader_compile the
       LINK_STATUS check is deferred to the RAF loop instead of blocking. */
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    if (!vertexShader) {
      onFail();
      return;
    }
    gl.shaderSource(vertexShader, FEEDBACK_VERTEX_SHADER);
    gl.compileShader(vertexShader);
    const buildProgram = (fragmentSource: string) => {
      const program = gl.createProgram();
      const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
      if (!fragmentShader) return null;
      gl.shaderSource(fragmentShader, fragmentSource);
      gl.compileShader(fragmentShader);
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      gl.deleteShader(fragmentShader);
      return program;
    };
    const accumProgram = buildProgram(ACCUMULATE_FRAGMENT_SHADER);
    const presentProgram = buildProgram(PRESENT_FRAGMENT_SHADER);
    gl.deleteShader(vertexShader);
    if (!accumProgram || !presentProgram) {
      onFail();
      return;
    }

    /* The route owns the viewport: ground colour on html/body (iOS
       rubber-band otherwise exposes beige gutters), overscroll pinned, the
       native scrollbar hidden in favour of the coral hairline. */
    const rootStyle = document.documentElement.style;
    const bodyStyle = document.body.style;
    const previous = {
      rootBackground: rootStyle.backgroundColor,
      bodyBackground: bodyStyle.backgroundColor,
      overscroll: rootStyle.overscrollBehavior,
    };
    rootStyle.backgroundColor = groundCss;
    bodyStyle.backgroundColor = groundCss;
    rootStyle.overscrollBehavior = 'none';
    const scrollbarStyle = document.createElement('style');
    scrollbarStyle.textContent = 'html{scrollbar-width:none}html::-webkit-scrollbar{display:none}';
    document.head.appendChild(scrollbarStyle);

    const count = items.length;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const accumBudget = coarse ? ACCUM_BUDGET_COARSE : ACCUM_BUDGET_DESKTOP;
    const textureResize = coarse ? COARSE_TEXTURE_SIZE : null;

    let disposed = false;
    let raf = 0;
    let linked = false;
    let seeded = false;
    let warmupLeft = 0;
    let last = performance.now();
    const mountTime = last;

    /* Scroll model state. */
    let maxScroll = 0;
    let needsResize = true;
    let travelPrev: number | null = null;
    let energy = INTRO_ENERGY;
    let dir = 1;
    let lastSeg = -1;

    /* Adaptive quality state. */
    let quality = 0;
    let grace = GRACE_FRAMES;
    let slowStreak = 0;
    let fastStreak = 0;

    /* GL resources. */
    let accumUniforms: AccumUniforms | null = null;
    let presentUniforms: PresentUniforms | null = null;
    let fieldTex: WebGLTexture[] = [];
    let fieldFbo: WebGLFramebuffer[] = [];
    let readIx = 0;
    let accumW = 0;
    let accumH = 0;
    let aspectX = 1;
    let aspectY = 1;

    const placeholderTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, placeholderTex);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.SRGB8_ALPHA8,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([...groundBytes, 255]),
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    /* --- texture streaming ----------------------------------------------- */

    const slots = new Map<number, Slot>();
    let uploadHandle: number | null = null;
    let uploadHandleIsIdle = false;

    const ensure = (index: number) => {
      if (slots.has(index)) return;
      const slot: Slot = { tex: null, state: 'fetching', bitmap: null, size: 0 };
      slots.set(index, slot);
      decodeBitmap(items[index].thumbnail, textureResize)
        .then((bitmap) => {
          if (disposed || slots.get(index) !== slot) return; // evicted meanwhile
          slot.bitmap = bitmap;
          slot.size = bitmap.width;
          slot.state = 'decoded';
          scheduleUpload();
        })
        .catch((error: unknown) => {
          console.warn(`przelot: texture failed: ${items[index].thumbnail}`, error);
          if (slots.get(index) === slot) slot.state = 'failed';
        });
    };

    const uploadPending = (slot: Slot) =>
      slot.state === 'decoded' || slot.state === 'allocated' || slot.state === 'uploaded';

    const hasUploadWork = () => {
      let pending = false;
      slots.forEach((slot) => {
        pending = pending || uploadPending(slot);
      });
      return pending;
    };

    /* One step per callback: allocate, then pixels, then mips — an unsplit
       8 MB texImage2D plus generateMipmap inside the render path is a
       guaranteed dropped frame. Deferred entirely while a fling is running
       unless the texture is needed within the current segment. */
    const pumpUpload = () => {
      uploadHandle = null;
      if (disposed) return;
      let jobIndex = -1;
      let jobUrgent = false;
      slots.forEach((slot, index) => {
        if (!uploadPending(slot) || jobUrgent) return;
        const urgent = index === lastSeg || index === (lastSeg + 1) % count;
        if (urgent || jobIndex < 0) {
          jobIndex = index;
          jobUrgent = urgent;
        }
      });
      const job = jobIndex >= 0 ? slots.get(jobIndex) : undefined;
      if (!job) return;
      const urgent = jobIndex === lastSeg || jobIndex === (lastSeg + 1) % count;
      if (energy > UPLOAD_DEFER_ENERGY && !urgent) return; // frame loop retries
      if (job.state === 'decoded') {
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        const levels = Math.floor(Math.log2(job.size)) + 1;
        gl.texStorage2D(gl.TEXTURE_2D, levels, gl.SRGB8_ALPHA8, job.size, job.size);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        job.tex = tex;
        job.state = 'allocated';
      } else if (job.state === 'allocated' && job.bitmap) {
        gl.bindTexture(gl.TEXTURE_2D, job.tex);
        gl.texSubImage2D(
          gl.TEXTURE_2D,
          0,
          0,
          0,
          job.size,
          job.size,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          job.bitmap,
        );
        job.bitmap.close();
        job.bitmap = null;
        job.state = 'uploaded';
      } else if (job.state === 'uploaded') {
        gl.bindTexture(gl.TEXTURE_2D, job.tex);
        gl.generateMipmap(gl.TEXTURE_2D);
        job.state = 'ready';
      }
      scheduleUpload();
    };

    const scheduleUpload = () => {
      if (disposed || uploadHandle !== null || !hasUploadWork()) return;
      if (typeof window.requestIdleCallback === 'function') {
        uploadHandleIsIdle = true;
        uploadHandle = window.requestIdleCallback(pumpUpload, { timeout: 100 });
      } else {
        uploadHandleIsIdle = false;
        uploadHandle = window.setTimeout(pumpUpload, 1);
      }
    };

    const evictBeyondWindow = (seg: number) => {
      slots.forEach((slot, index) => {
        const forward = (index - seg + count) % count;
        const backward = (seg - index + count) % count;
        if (Math.min(forward, backward) > KEEP_DISTANCE) {
          if (slot.tex) gl.deleteTexture(slot.tex);
          /* An in-flight bitmap is dropped, not closed: the decode promise
             may be shared with a fresher mount of this component. */
          slots.delete(index);
        }
      });
    };

    const slotTexture = (index: number): WebGLTexture | null => {
      const slot = slots.get(index);
      return slot?.state === 'ready' ? slot.tex : null;
    };

    /* --- field allocation -------------------------------------------------- */

    const destroyPair = (texes: WebGLTexture[], fbos: WebGLFramebuffer[]) => {
      fbos.forEach((fbo) => gl.deleteFramebuffer(fbo));
      texes.forEach((tex) => gl.deleteTexture(tex));
    };

    const tryCreatePair = (w: number, h: number, useHalf: boolean) => {
      const texes: WebGLTexture[] = [];
      const fbos: WebGLFramebuffer[] = [];
      for (let n = 0; n < 2; n += 1) {
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texStorage2D(gl.TEXTURE_2D, 1, useHalf ? gl.RGBA16F : gl.SRGB8_ALPHA8, w, h);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        const fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
        texes.push(tex);
        fbos.push(fbo);
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
          destroyPair(texes, fbos);
          return null;
        }
      }
      /* Both start as the ground colour; clears convert from linear on an
         sRGB attachment, so one linear clear value serves both formats. */
      gl.clearColor(groundLinear[0], groundLinear[1], groundLinear[2], 1);
      for (const fbo of fbos) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      return { texes, fbos };
    };

    const setDitherUniform = () => {
      if (!accumUniforms) return;
      gl.useProgram(accumProgram);
      gl.uniform1f(accumUniforms.uDither, halfFloat ? 0 : FALLBACK_DITHER);
    };

    const createPair = (w: number, h: number) => {
      let pair = tryCreatePair(w, h, halfFloat);
      if (!pair && halfFloat) {
        halfFloat = false;
        setDitherUniform();
        pair = tryCreatePair(w, h, false);
      }
      return pair;
    };

    /* --- passes ------------------------------------------------------------ */

    type AccumPass = {
      keep: number;
      soak: number;
      creep: number;
      swell: number;
      blend: number;
      planeSwell: number;
      prism: number;
      smear: number;
      time: number;
      photoA: WebGLTexture | null;
      photoB: WebGLTexture | null;
      source: WebGLTexture;
      targetFbo: WebGLFramebuffer;
      targetW: number;
      targetH: number;
    };

    const runAccumulate = (pass: AccumPass) => {
      if (!accumUniforms) return;
      gl.bindFramebuffer(gl.FRAMEBUFFER, pass.targetFbo);
      gl.viewport(0, 0, pass.targetW, pass.targetH);
      gl.invalidateFramebuffer(gl.FRAMEBUFFER, [gl.COLOR_ATTACHMENT0]);
      gl.useProgram(accumProgram);
      gl.uniform1f(accumUniforms.uTime, pass.time);
      gl.uniform1f(accumUniforms.uCreep, pass.creep);
      gl.uniform1f(accumUniforms.uSwell, pass.swell);
      gl.uniform1f(accumUniforms.uKeep, pass.keep);
      gl.uniform1f(accumUniforms.uSoak, pass.soak);
      gl.uniform1f(accumUniforms.uBlend, pass.blend);
      gl.uniform1f(accumUniforms.uPlaneSwell, pass.planeSwell);
      gl.uniform1f(accumUniforms.uPrism, pass.prism);
      gl.uniform1f(accumUniforms.uSmear, pass.smear);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, pass.source);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, pass.photoA ?? placeholderTex);
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, pass.photoB ?? placeholderTex);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const runPresent = (time: number, glitch = 0, scope = SCOPE_IDLE, chop = 0) => {
      if (!presentUniforms) return;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(presentProgram);
      gl.uniform1f(presentUniforms.uTime, time);
      gl.uniform1f(presentUniforms.uGlitch, glitch);
      gl.uniform1f(presentUniforms.uScope, scope);
      gl.uniform3f(presentUniforms.uScopeChopSet, chop, SCOPE_CELLS, SCOPE_BREAK);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, fieldTex[readIx]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    /* Step the integrator: write 1-readIx from readIx, then swap. */
    const step = (
      pass: Omit<AccumPass, 'source' | 'targetFbo' | 'targetW' | 'targetH'>,
    ) => {
      runAccumulate({
        ...pass,
        source: fieldTex[readIx],
        targetFbo: fieldFbo[1 - readIx],
        targetW: accumW,
        targetH: accumH,
      });
      readIx = 1 - readIx;
    };

    /* --- resize ------------------------------------------------------------ */

    const reallocateField = (w: number, h: number, time: number): boolean => {
      const pair = createPair(w, h);
      if (!pair) return false;
      if (fieldTex.length && seeded) {
        /* Rescale-blit the live field into the new allocation (the accumulate
           program with keep=1, soak=0 and no warp is a pure LINEAR resample),
           or a quality change would visibly restart the piece from ground. */
        runAccumulate({
          keep: 1,
          soak: 0,
          creep: 0,
          swell: 0,
          blend: 0,
          planeSwell: 1,
          prism: 0,
          smear: 0,
          time,
          photoA: null,
          photoB: null,
          source: fieldTex[readIx],
          targetFbo: pair.fbos[0],
          targetW: w,
          targetH: h,
        });
      }
      if (fieldTex.length) destroyPair(fieldTex, fieldFbo);
      fieldTex = pair.texes;
      fieldFbo = pair.fbos;
      readIx = 0;
      accumW = w;
      accumH = h;
      return true;
    };

    const applyResize = (time: number): boolean => {
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      const width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      const short = Math.min(width, height);
      aspectX = width / short;
      aspectY = height / short;
      if (accumUniforms && presentUniforms) {
        gl.useProgram(accumProgram);
        gl.uniform2f(accumUniforms.uAspect, aspectX, aspectY);
        gl.useProgram(presentProgram);
        gl.uniform2f(presentUniforms.uAspect, aspectX, aspectY);
      }
      const fit = Math.min(1, Math.sqrt(accumBudget / (width * height)));
      const scale = fit * QUALITY_STEPS[quality];
      const w = Math.max(2, Math.round(width * scale));
      const h = Math.max(2, Math.round(height * scale));
      maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (w === accumW && h === accumH) return true;
      return reallocateField(w, h, time);
    };

    const requestResize = () => {
      needsResize = true;
    };

    /* Runs once, on the first frame with both programs confirmed linked. */
    const finishInit = (time: number): boolean => {
      const au = (name: string) => gl.getUniformLocation(accumProgram, name);
      const pu = (name: string) => gl.getUniformLocation(presentProgram, name);
      accumUniforms = {
        uAspect: au('uAspect'),
        uTime: au('uTime'),
        uCreep: au('uCreep'),
        uSwell: au('uSwell'),
        uKeep: au('uKeep'),
        uSoak: au('uSoak'),
        uBlend: au('uBlend'),
        uPlaneSwell: au('uPlaneSwell'),
        uDither: au('uDither'),
        uPrism: au('uPrism'),
        uSmear: au('uSmear'),
      };
      presentUniforms = {
        uAspect: pu('uAspect'),
        uTime: pu('uTime'),
        uGlitch: pu('uGlitch'),
        uScope: pu('uScope'),
        uScopeChopSet: pu('uScopeChopSet'),
      };
      gl.useProgram(accumProgram);
      gl.uniform1i(au('uField'), 0);
      gl.uniform1i(au('uPhotoA'), 1);
      gl.uniform1i(au('uPhotoB'), 2);
      gl.uniform1f(au('uBandK'), BAND_K);
      gl.uniform1f(au('uBandPhase'), BAND_PHASE);
      gl.uniform1f(au('uDrift'), DRIFT);
      gl.uniform1f(au('uLumBend'), LUM_BEND);
      gl.uniform1f(au('uPlaneHalf'), PLANE_HALF);
      gl.uniform3f(au('uGround'), groundLinear[0], groundLinear[1], groundLinear[2]);
      gl.uniform1f(accumUniforms.uDither, halfFloat ? 0 : FALLBACK_DITHER);
      gl.useProgram(presentProgram);
      gl.uniform1i(pu('uField'), 0);
      gl.uniform1f(pu('uExposure'), ground === 'beige' ? EXPOSURE_BEIGE : EXPOSURE_DARK);
      gl.uniform1f(pu('uVignette'), ground === 'beige' ? VIGNETTE_BEIGE : VIGNETTE_DARK);
      gl.uniform1f(pu('uGrain'), GRAIN);
      gl.uniform1f(pu('uSliceCount'), SLICE_COUNT);
      gl.uniform1f(pu('uScopeSpread'), SCOPE_SPREAD);
      gl.uniform1f(pu('uScopeGain'), SCOPE_GAIN);
      gl.uniform1f(pu('uScopeShake'), SCOPE_SHAKE);
      gl.uniform3f(
        pu('uScopeTint'),
        SCOPE_TINT_CORAL[0],
        SCOPE_TINT_CORAL[1],
        SCOPE_TINT_CORAL[2],
      );
      needsResize = false;
      return applyResize(time);
    };

    /* --- frame loop -------------------------------------------------------- */

    const frame = (now: number) => {
      /* A cancelled id can still deliver one queued callback (StrictMode
         remounts land between schedule and fire); polling deleted programs
         floods the console with GL_INVALID_VALUE. */
      if (disposed) return;
      raf = requestAnimationFrame(frame);

      if (!linked) {
        if (
          parallel &&
          (!gl.getProgramParameter(accumProgram, parallel.COMPLETION_STATUS_KHR) ||
            !gl.getProgramParameter(presentProgram, parallel.COMPLETION_STATUS_KHR))
        ) {
          return; // still compiling; the ground-coloured clear is on screen
        }
        if (
          !gl.getProgramParameter(accumProgram, gl.LINK_STATUS) ||
          !gl.getProgramParameter(presentProgram, gl.LINK_STATUS)
        ) {
          stop();
          onFail();
          return;
        }
        linked = true;
        if (!finishInit((now - mountTime) / 1000)) {
          stop();
          onFail();
          return;
        }
      }

      const dtMs = Math.min(now - last, 100);
      last = now;
      const dt = Math.min(Math.max(dtMs / 1000, DT_MIN), DT_MAX);
      const time = (now - mountTime) / 1000;

      if (needsResize) {
        needsResize = false;
        if (!applyResize(time)) {
          stop();
          onFail();
          return;
        }
      }

      /* Adaptive accumulator resolution with hysteresis: streaks of raw
         frame times, so a single GC or upload stall cannot downshift, and a
         grace window skips the warm-up burst. */
      if (grace > 0 || warmupLeft > 0) {
        grace = Math.max(grace - 1, 0);
      } else if (dtMs > FRAME_BUDGET_MS) {
        fastStreak = 0;
        slowStreak += 1;
        if (slowStreak >= DOWNSHIFT_STREAK && quality < QUALITY_STEPS.length - 1) {
          quality += 1;
          slowStreak = 0;
          needsResize = true;
        }
      } else {
        slowStreak = 0;
        if (dtMs < UPSHIFT_BUDGET_MS) {
          fastStreak += 1;
          if (fastStreak >= UPSHIFT_STREAK && quality > 0) {
            quality -= 1;
            fastStreak = 0;
            needsResize = true;
          }
        } else {
          fastStreak = 0;
        }
      }

      /* Scroll -> travel. T is raw; the accumulator itself is the low-pass. */
      const progress = maxScroll > 0 ? Math.min(Math.max(window.scrollY / maxScroll, 0), 1) : 0;
      const travel = progress * count;
      const vRaw = travelPrev === null ? 0 : (travel - travelPrev) / dt;
      travelPrev = travel;

      /* Energy: snaps on within ~5 frames, coasts off over ~3.3 s — the
         coast is what keeps the vortex developing after the hand stops. */
      const target = Math.min(Math.abs(vRaw) / V_REF, 1);
      energy += (target - energy) * (1 - Math.exp(-dt / (target > energy ? TAU_ATTACK : TAU_RELEASE)));
      const dirTarget = vRaw > 0.02 ? 1 : vRaw < -0.02 ? -1 : 1;
      dir += (dirTarget - dir) * (1 - Math.exp(-dt / TAU_DIR));

      let zRate = Z_IDLE + (Z_PEAK - Z_IDLE) * energy;
      const aRate = A_IDLE + (A_PEAK - A_IDLE) * energy;
      if (commitRef.current) {
        const commitT = Math.min((now - commitRef.current.started) / COMMIT_MS, 1);
        energy = 1;
        dir = 1;
        zRate *= 1 + COMMIT_PUNCH * commitT * commitT;
      }

      const seg = Math.floor(travel) % count;
      const nextSeg = (seg + 1) % count;
      const frac = travel - Math.floor(travel);

      /* Streaming window [seg-1, seg, seg+1, seg+2]; eviction only on a
         segment change, with the trailing neighbour kept as reversal
         hysteresis. */
      ensure(seg);
      ensure(nextSeg);
      ensure((seg + count - 1) % count);
      if (frac >= PREFETCH_FRAC) ensure((seg + 2) % count);
      if (seg !== lastSeg) {
        lastSeg = seg;
        evictBeyondWindow(seg);
      }

      /* Seed once the first photograph is resident: one accumulate pass with
         keep=0/soak=1 writes ground + plane, then the warm-up burst develops
         the field so the first paint is already alive. */
      if (!seeded) {
        const slot = slots.get(seg);
        if (slot && (slot.state === 'ready' || slot.state === 'failed')) {
          const tex = slot.state === 'ready' ? slot.tex : placeholderTex;
          step({
            keep: 0,
            soak: 1,
            creep: 0,
            swell: 0,
            blend: 0,
            planeSwell: 1,
            prism: 0,
            smear: 0,
            time,
            photoA: tex,
            photoB: tex,
          });
          seeded = true;
          warmupLeft = WARMUP_STEPS;
        } else {
          runPresent(time);
          scheduleUpload();
          return;
        }
      }

      const texA = slotTexture(seg) ?? placeholderTex;
      const texBReady = slotTexture(nextSeg);
      const s = smoothstep(BLEND_START, BLEND_END, frac);
      const blend = texBReady ? s : 0;
      const texB = texBReady ?? texA;
      const planeSwell = 1 + PLANE_SWELL * 4 * blend * (1 - blend);

      if (warmupLeft > 0) {
        const burstStart = performance.now();
        let steps = 0;
        while (
          warmupLeft > 0 &&
          (steps < 2 || performance.now() - burstStart < WARMUP_BURST_MS)
        ) {
          step({
            keep: Math.exp(-WARMUP_DT / TAU_TAIL),
            soak: 1 - Math.exp(-WARMUP_DT / TAU_PLANE),
            creep: (Z_IDLE + (Z_PEAK - Z_IDLE) * INTRO_ENERGY) * WARMUP_DT,
            swell: (A_IDLE + (A_PEAK - A_IDLE) * INTRO_ENERGY) * WARMUP_DT,
            blend,
            planeSwell: 1,
            prism: PRISM_IDLE + (PRISM_PEAK - PRISM_IDLE) * INTRO_ENERGY,
            smear: SMEAR_IDLE + (SMEAR_PEAK - SMEAR_IDLE) * INTRO_ENERGY,
            time,
            photoA: texA,
            photoB: texB,
          });
          warmupLeft -= 1;
          steps += 1;
        }
        runPresent(time);
        scheduleUpload();
        return;
      }

      const keep = Math.exp(-dt / TAU_TAIL);
      if (process.env.NODE_ENV !== 'production') {
        console.assert(keep < 0.9999, 'przelot: uKeep must stay strictly below 1');
      }

      step({
        keep,
        soak: 1 - Math.exp(-dt / TAU_PLANE),
        creep: Math.min(Math.max(zRate * dt * dir, -CREEP_CLAMP), CREEP_CLAMP),
        swell: aRate * dt,
        blend,
        planeSwell,
        prism: PRISM_IDLE + (PRISM_PEAK - PRISM_IDLE) * energy,
        smear: SMEAR_IDLE + (SMEAR_PEAK - SMEAR_IDLE) * energy,
        time,
        photoA: texA,
        photoB: texB,
      });
      /* Tearing only above the gate, ramped from zero at the threshold so it
         arrives as the scroll accelerates rather than switching on. */
      const glitch =
        energy > GLITCH_ENERGY_GATE
          ? GLITCH_MAX * ((energy - GLITCH_ENERGY_GATE) / (1 - GLITCH_ENERGY_GATE))
          : 0;
      const chop =
        energy > SCOPE_CHOP_GATE
          ? SCOPE_CHOP_MAX * ((energy - SCOPE_CHOP_GATE) / (1 - SCOPE_CHOP_GATE))
          : 0;
      runPresent(
        time,
        glitch,
        SCOPE_IDLE + (SCOPE_PEAK - SCOPE_IDLE) * energy,
        chop,
      );

      /* The pill, the centre-click target and the analytics event all follow
         the plane: whichever photograph owns more than half the blend. */
      const current = blend >= 0.5 ? nextSeg : seg;
      if (current !== currentIndexRef.current) {
        currentIndexRef.current = current;
        setCurrentIndex(current);
      }

      scheduleUpload();
    };

    const start = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const handleVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      stop();
      onFail();
    };

    window.addEventListener('resize', requestResize);
    document.addEventListener('visibilitychange', handleVisibility);
    canvas.addEventListener('webglcontextlost', handleContextLost);
    start();
    track('przelot_entered');

    return () => {
      disposed = true;
      stop();
      if (uploadHandle !== null) {
        if (uploadHandleIsIdle) window.cancelIdleCallback(uploadHandle);
        else window.clearTimeout(uploadHandle);
        uploadHandle = null;
      }
      window.removeEventListener('resize', requestResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      scrollbarStyle.remove();
      rootStyle.backgroundColor = previous.rootBackground;
      bodyStyle.backgroundColor = previous.bodyBackground;
      rootStyle.overscrollBehavior = previous.overscroll;
      slots.forEach((slot) => {
        if (slot.tex) gl.deleteTexture(slot.tex);
        /* In-flight bitmaps are dropped, not closed — the decode promise may
           be shared with a fresher mount (StrictMode, locale switch). */
        slot.bitmap = null;
      });
      slots.clear();
      gl.deleteTexture(placeholderTex);
      if (fieldTex.length) destroyPair(fieldTex, fieldFbo);
      gl.deleteProgram(accumProgram);
      gl.deleteProgram(presentProgram);
      /* No loseContext() here: a remount reuses this canvas node (StrictMode,
         Fast Refresh), and getContext('webgl2') on a lost-context canvas
         returns the same dead context, which would fail init forever. The
         deletes above release the VRAM; the context dies with the element. */
    };
  }, [items, onFail, groundCss, ground]);

  return (
    <>
      <div aria-hidden="true" className="fixed inset-0 -z-10" style={{ backgroundColor: groundCss }} />
      <div
        className={`fixed inset-0 transition-opacity duration-[400ms] ease-in ${fading ? 'opacity-0' : 'opacity-100'}`}
      >
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          onClick={handleCanvasClick}
          className="absolute inset-0 h-full w-full"
        />
        <CaptionRail
          item={items[currentIndex]}
          groundBeige={ground === 'beige'}
          onCommit={commit}
        />
      </div>
      <div aria-hidden="true" style={{ height: `${items.length * SEGMENT_VH}vh` }} />
    </>
  );
}
