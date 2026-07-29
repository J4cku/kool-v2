/* Feedback accumulator for przelot, replacing the v1 log-polar tunnel.
   Original GLSL, re-derived from the rebuild brief's math rather than any
   published shader body.

   Two programs over one attribute-less fullscreen triangle. The accumulate
   pass warps the previous field a fraction of a percent per frame — a radial
   creep with a non-conformal profile plus a banded vertical shear whose curl
   is a row of counter-rotating cells — relaxes it toward the ground colour,
   and soaks the current photograph into a centred plane. Structure builds by
   compounding over ~200 frames, not in any single pass. The present pass
   reads the field, applies exposure, vignette and grain, and encodes sRGB.

   Constant provenance: the band phase is solved from k/2 + phi = 3*pi/2 (a
   vorticity zero on the centre line); the hash is the public-domain murmur3
   fmix32 finaliser with the golden-ratio constant; srgb encode is the
   IEC 61966-2-1 transfer function. */

export const FEEDBACK_VERTEX_SHADER = `#version 300 es
out vec2 vUv;
void main() {
  vec2 tri[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
  vec2 pos = tri[gl_VertexID];
  vUv = pos * 0.5 + 0.5;
  gl_Position = vec4(pos, 0.0, 1.0);
}
`;

export const ACCUMULATE_FRAGMENT_SHADER = `#version 300 es
precision highp float;
precision highp sampler2D;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uField;   // previous accumulator, linear light
uniform sampler2D uPhotoA;  // outgoing project (SRGB8_ALPHA8, linear on fetch)
uniform sampler2D uPhotoB;  // incoming project
uniform vec2 uAspect;       // vec2(w, h) / min(w, h): short edge spans 1
uniform float uTime;        // seconds since mount
uniform float uCreep;       // signed per-frame radial step
uniform float uSwell;       // per-frame shear amplitude
uniform float uBandK;       // shear band frequency, rad per unit uv.x
uniform float uBandPhase;   // static offset placing the eye pair
uniform float uDrift;       // band phase drift, rad/s
uniform float uLumBend;     // luminance -> phase coupling, rad
uniform float uKeep;        // field retention this frame = exp(-dt / tauTail)
uniform float uSoak;        // plane injection this frame = 1 - exp(-dt / tauPlane)
uniform float uBlend;       // 0 = photo A, 1 = photo B
uniform float uPlaneHalf;   // plane half-extent, short-edge units
uniform float uPlaneSwell;  // transient scale bump during a handoff
uniform vec3 uGround;       // ground colour, linear light
uniform float uDither;      // 0 on RGBA16F, ~one quantum on the SRGB8 fallback
uniform float uPrism;       // per-frame radial split between R and B, field units
uniform float uSmear;       // 0..1 advection bias: how far the tail chases the flow

const vec3 LUMA = vec3(0.2126, 0.7152, 0.0722);

vec2 toField(vec2 uv) { return (uv - 0.5) * uAspect; }
vec2 toUv(vec2 q) { return q / uAspect + 0.5; }

/* murmur3-style integer finaliser; only feeds the fallback-format dither. */
float speck(uvec2 cell, uint salt) {
  uint h = cell.x * 0x9e3779b1u + cell.y * 0x85ebca6bu + salt * 0xc2b2ae35u;
  h ^= h >> 16; h *= 0x85ebca6bu;
  h ^= h >> 13; h *= 0xc2b2ae35u;
  h ^= h >> 16;
  return float(h) * (1.0 / 4294967296.0);
}

void main() {
  vec2 q = toField(vUv);
  float rad = length(q);

  /* Radial creep: read inboard of where we write, so every feature edges
     outward one step per frame. The profile is slow at the pole and in the
     corners and fast through the mid annulus — adjacent radii advance at
     different rates, which stops the map being a pure similarity and gives
     the shear something to curl against. */
  float core = smoothstep(0.05, 0.42, rad);
  float rim = 1.0 - smoothstep(0.86, 1.90, rad);
  float creep = mix(0.35, 1.0, core * rim);
  vec2 crept = q * (1.0 - uCreep * creep);

  /* One luminance probe of the field where the creep lands. Its brightness
     steers both the phase and the reach of the shear, so the picture drives
     its own motion and every project swirls differently. */
  float lum = clamp(dot(texture(uField, toUv(crept)).rgb, LUMA), 0.0, 1.0);

  /* Banded vertical shear. d = (0, A sin(k x + ...)) has curl
     A k cos(k x + ...): the vorticity flips sign every half period, a row of
     counter-rotating cells. uBandPhase puts a vorticity zero on the centre
     line and an extremum either side; uDrift lets the pair wander; uLumBend
     adds dL/dx to the effective frequency so the photograph's own edges seed
     extra vorticity. */
  float phase = vUv.x * uBandK + uBandPhase + uTime * uDrift + lum * uLumBend;
  /* The reach tapers off toward the corners, and also toward the plane core:
     without the inner taper the resting photograph carries a permanent
     vertical smear of A_idle * tauPlane (~7% of the frame) and never reads
     as a photograph. Vorticity still nucleates on the plane edge, where the
     inner taper is already ~0.8. */
  float reach = uSwell * (0.62 + 0.76 * lum)
              * smoothstep(0.12, 0.42, rad)
              * (1.0 - smoothstep(0.30, 1.70, rad));
  vec2 moved = crept + vec2(0.0, sin(phase) * reach);

  /* Prismatic split. Each channel reads the field from a slightly different
     radius, so a feature's components separate by a hair every frame and
     compound over the tail into colour fringes that trail the flow — the
     dispersion reads as optical rather than as an added tint, because no
     channel is ever scaled, only displaced. Brighter material splits wider,
     which keeps the dark ground clean. */
  float split = uPrism * (0.30 + 0.70 * lum);
  /* A second, longer read along the same direction, blended in behind the
     first: the tail stops being a pure decay of what was there and starts
     genuinely chasing the flow, which is what turns smear into streaks. */
  vec2 far = moved * (1.0 + uSmear * 0.06);
  vec3 field = vec3(
    texture(uField, toUv(moved * (1.0 - split))).r,
    texture(uField, toUv(moved)).g,
    texture(uField, toUv(moved * (1.0 + split))).b
  );
  field = mix(field, texture(uField, toUv(far)).rgb, uSmear * 0.34);

  /* The photo plane: a centred square over 72% of the short edge. Its border
     against the ground is the frame's strongest luminance edge and therefore
     the main vorticity source; a full-bleed fill would have none. */
  vec2 plane = q / (uPlaneHalf * uPlaneSwell);
  /* Flip v: clip-space +y is up so vUv.y = 1 is the top of the screen, but
     the textures upload unflipped, putting image row 0 — the top of the
     photograph — at v = 0. Mapping straight through stands every project on
     its head. The field itself needs no flip; it is only ever read from and
     written to in its own space. */
  vec2 planeUv = vec2(plane.x, -plane.y) * 0.5 + 0.5;
  vec2 falloff = 1.0 - smoothstep(vec2(0.955), vec2(1.0), abs(plane));
  float mask = falloff.x * falloff.y;
  vec3 photo = mix(texture(uPhotoA, planeUv).rgb,
                   texture(uPhotoB, planeUv).rgb, uBlend);

  /* Leaky integrator: outside the plane the field only drifts and relaxes
     onto the ground; inside, it converges on the photograph with its own,
     much faster constant. Injection is a mix, never an add, so values stay
     bounded in [0, 1]. */
  vec3 relaxed = mix(uGround, field, uKeep);
  vec3 result = mix(relaxed, photo, mask * uSoak);

  /* Live only on the 8-bit fallback target: without it the decay step falls
     under half a quantum below ~20% grey and the tail freezes into fixed
     plateaus. */
  result += (speck(uvec2(gl_FragCoord.xy), uint(uTime * 1000.0)) - 0.5) * uDither;

  fragColor = vec4(result, 1.0);
}
`;

export const PRESENT_FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uField;
uniform vec2 uAspect;
uniform float uTime;
uniform float uExposure;
uniform float uVignette;
uniform float uGrain;
uniform float uGlitch;      // 0..1 burst intensity; 0 = perfectly clean frame
uniform float uSliceCount;  // horizontal bands the frame is cut into
uniform float uScope;       // 0..1 contour trace opacity
uniform float uScopeSpread; // gradient probe distance, texels
uniform float uScopeGain;   // gradient magnitude that reads as a full edge
uniform float uScopeShake;  // contour tremble amplitude, uv units
uniform vec3 uScopeChopSet; // x: 0..1 chop, y: cells across frame, z: breakaway
uniform vec3 uScopeTint;    // trace colour, linear light

const vec3 SCOPE_LUMA = vec3(0.2126, 0.7152, 0.0722);

vec3 encodeSrgb(vec3 c) {
  vec3 lo = c * 12.92;
  vec3 hi = 1.055 * pow(max(c, vec3(0.0)), vec3(1.0 / 2.4)) - 0.055;
  return mix(lo, hi, step(vec3(0.0031308), c));
}

float speck(uvec2 cell, uint salt) {
  uint h = cell.x * 0x9e3779b1u + cell.y * 0x85ebca6bu + salt * 0xc2b2ae35u;
  h ^= h >> 16; h *= 0x85ebca6bu;
  h ^= h >> 13; h *= 0xc2b2ae35u;
  h ^= h >> 16;
  return float(h) * (1.0 / 4294967296.0);
}

void main() {
  /* Slice displacement. The frame is cut into bands; each band draws a fresh
     lot every ~1/6 s and only the top uGlitch fraction of lots fire, so the
     tearing arrives in bursts on a fling and is completely absent at rest
     (uGlitch = 0 makes fire = step(1.0, roll), which no lot below 1 passes).
     Deliberately in the present pass and not the accumulator: displacement
     that fed back would carve permanent scars into the field and, once torn,
     the geometry could never heal. Here every frame starts clean. */
  vec2 guv = vUv;
  float tear = 0.0;
  if (uGlitch > 0.0) {
    float band = floor(vUv.y * uSliceCount);
    uint tick = uint(uTime * 6.0);
    float roll = speck(uvec2(uint(band), tick), 0x9e37u);
    float fire = step(1.0 - uGlitch, roll);
    tear = (speck(uvec2(uint(band), tick), 0x85ebu) - 0.5) * 0.22 * uGlitch * fire;
    /* fract, not clamp: a wrapped slice reads as a torn transmission, a
       clamped one as a smeared edge. */
    guv.x = fract(guv.x + tear);
  }

  vec3 col = texture(uField, guv).rgb * uExposure;

  /* On a torn band the channels separate too — the tear is the only place
     the piece shows hard RGB fringing, which is what marks it as a signal
     fault rather than an optical one. */
  if (tear != 0.0) {
    float rgbSplit = tear * 0.35;
    col.r = texture(uField, vec2(fract(guv.x + rgbSplit), guv.y)).r * uExposure;
    col.b = texture(uField, vec2(fract(guv.x - rgbSplit), guv.y)).b * uExposure;
  }

  float rad = length((vUv - 0.5) * uAspect);
  col *= mix(1.0, 1.0 - uVignette, smoothstep(0.35, 1.15, rad));

  /* Oscilloscope traces. The frame is divided into lanes; each lane probes the
     field along its own centre row and deflects vertically with what it finds,
     so a trace is a waveform of the picture underneath it rather than an
     overlay laid on top. Deflection is clamped inside the lane so neighbouring
     traces can never cross and read as a tangle.

     Two probes one texel apart give a horizontal gradient. That gradient — not
     brightness — sets the trace's intensity, so the line runs dim across flat
     wall and flares exactly where the photograph has an edge worth looking at:
     a window reveal, a shelf, the lamp. The detail selects itself.

     The shake is per-lane and re-drawn ~24x/s, so lanes jitter independently
     like channels sharing a timebase rather than the whole frame wobbling. */
  if (uScope > 0.0) {
    vec2 texel = 1.0 / vec2(textureSize(uField, 0));

    /* The tremble has to be spatially coherent or the contour dissolves into
       noise instead of wobbling as a line. Two sine pairs at different
       frequencies and drift rates give a smooth, non-repeating displacement
       field: neighbouring pixels sample almost the same offset, so a whole
       edge sways together the way a trace does on a scope with a loose
       ground. Sampling is displaced, never the output — the contour moves
       across the picture rather than the picture moving. */
    /* Three octaves, roughly 2.9x apart, and none of them a multiple of the
       field's own band frequency (uBandK 8.6) or its 0.22 rad/s drift. That
       matters: if the traces shared a wavelength with the shear underneath
       they would phase-lock to it and read as part of the same animation.
       Detuned, they behave like a separate layer with its own weather — a
       long swell that drifts whole contours as a group, a mid ripple, and a
       fine tremble on top.

       Each axis is driven by BOTH coordinates rather than its own, so the
       field is not separable and the motion never collapses into visible
       horizontal and vertical banding. */
    vec2 wob =
        vec2(sin(vUv.y * 4.7 + vUv.x * 1.9 + uTime * 0.83),
             cos(vUv.x * 3.9 - vUv.y * 2.3 - uTime * 0.67)) * 1.00
      + vec2(sin(vUv.y * 12.9 - vUv.x * 5.1 - uTime * 2.31),
             cos(vUv.x * 15.7 + vUv.y * 6.3 + uTime * 1.97)) * 0.42
      + vec2(sin(vUv.y * 41.3 + vUv.x * 17.9 + uTime * 7.13),
             cos(vUv.x * 37.1 - vUv.y * 21.7 - uTime * 6.29)) * 0.17;
    wob *= uScopeShake;
    vec2 p = vUv + wob;

    /* Chop. On a fling the contours stop being a faithful outline and start
       living on their own: the frame is diced into cells, each cell draws its
       own lot on a stepped clock, and a lot decides both how far that piece
       of contour tears away from the geometry it came from and whether it is
       drawn at all this tick. Because the clock is quantised the pieces snap
       between positions instead of gliding — the motion is stuttered, not
       smooth, which is what separates a broken signal from a slow one.

       The +8.0 bias keeps the cell index positive before the unsigned cast;
       a negative float to uint conversion is undefined. */
    float chop = uScopeChopSet.x;
    float alive = 1.0;
    if (chop > 0.0) {
      uvec2 cellId = uvec2(floor((vUv + 8.0) * uScopeChopSet.y));
      uint tq = uint(uTime * 15.0);
      float ha = speck(cellId, tq * 3u + 1u);
      float hb = speck(cellId, tq * 3u + 2u);
      float hc = speck(cellId, tq * 3u + 3u);
      p += (vec2(ha, hb) - 0.5) * uScopeChopSet.z * chop;
      /* Up to ~60% of segments blink out at full chop, so the outline reads
         as fragments of itself rather than a dashed line. */
      alive = step(chop * 0.6, hc);
    }

    /* Central-difference gradient, four taps rather than a nine-tap Sobel:
       the field is intrinsically soft, so the extra corner taps buy no
       accuracy and cost 2.4 Mpx of bandwidth a frame. The probe spans
       several texels because a one-texel difference on blurred material is
       mostly dither. */
    vec2 d = texel * uScopeSpread;
    float lXm = dot(texture(uField, p - vec2(d.x, 0.0)).rgb, SCOPE_LUMA);
    float lXp = dot(texture(uField, p + vec2(d.x, 0.0)).rgb, SCOPE_LUMA);
    float lYm = dot(texture(uField, p - vec2(0.0, d.y)).rgb, SCOPE_LUMA);
    float lYp = dot(texture(uField, p + vec2(0.0, d.y)).rgb, SCOPE_LUMA);

    /* Gradient magnitude peaks along an object's silhouette, so the trace
       lands on the leg of a chair, the lip of a shelf, the edge of a table —
       wherever the photograph actually changes. No lanes, no fixed geometry:
       the picture supplies the lines. */
    vec2 grad = vec2(lXp - lXm, lYp - lYm);
    float mag = length(grad);

    /* Normalise against local brightness so contours in shadow read as
       strongly as contours in a bright window, then square the response to
       thin the gradient band into something line-like. */
    float localLum = (lXm + lXp + lYm + lYp) * 0.25;
    float edge = mag / (localLum * 0.85 + 0.06);
    /* The response window narrows as chop rises and then hardens to a plain
       threshold: at rest the contour is a soft gradient that sits in the
       photograph, on a fling it is a hard-edged aliased line sitting on top
       of it. Sharpness is the other half of "choppy" — a soft dashed line
       still reads as an effect, a hard one reads as a fault. */
    edge = smoothstep(mix(0.35, 0.58, chop), mix(1.0, 0.70, chop), edge / uScopeGain);
    edge = mix(edge * edge, step(0.5, edge), chop);
    edge *= alive;

    /* Suppress over bare ground, so the traces belong to the photograph and
       do not draw a net across the empty frame. */
    edge *= smoothstep(0.015, 0.10, localLum);

    col += uScopeTint * edge * uScope;
  }

  /* One noise term doing two jobs: half an 8-bit quantum of it kills the
     banding the output encode would otherwise show in the long dark tail,
     and a little more reads as film grain over the photographic plane. */
  float n = speck(uvec2(gl_FragCoord.xy), uint(uTime * 997.0)) - 0.5;

  fragColor = vec4(encodeSrgb(max(col, vec3(0.0))) + n * uGrain, 1.0);
}
`;
