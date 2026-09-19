/**
 * Divotz palette generator.
 *
 * The product spec gives three anchors per family (light / regular / dark).
 * Tailwind wants a full ramp, so we interpolate in OKLab — perceptually even
 * steps, no muddy midpoints — and extrapolate the tails.
 *
 * Anchors land on 100 (light), 500 (regular) and 800 (dark), which keeps the
 * spec's "regular" value as the one a component reaches for by default.
 *
 * Run: node scripts/generate-palette.mjs > src/styles/palette.css
 */

const ANCHORS = {
  grey: { light: "#E7E6E0", regular: "#343732", dark: "#1E211E" },
  cream: { light: "#FCFBF7", regular: "#F5F2E9", dark: "#E7E1D3" },
  green: { light: "#DDE8DC", regular: "#5E765A", dark: "#304832" },
  sand: { light: "#F1E9D7", regular: "#D6C19B", dark: "#A88E63" },
  blue: { light: "#DCE7EC", regular: "#6F8E9E", dark: "#3F5F6F" },
  danger: { light: "#F4DAD5", regular: "#B85C50", dark: "#7D3028" },
  warning: { light: "#F4E8B9", regular: "#C6A73A", dark: "#806B18" },
  success: { light: "#D8E8D5", regular: "#5C8A54", dark: "#376137" },
};

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

/* ---------- colour space plumbing ---------- */

const hexToRgb = (hex) => {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
};

const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055);

function rgbToOklab([r, g, b]) {
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function oklabToRgb([L, a, bb]) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * bb) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * bb) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * bb) ** 3;
  const lr = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const lg = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const lb = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  return [lr, lg, lb].map((c) => Math.min(1, Math.max(0, toGamma(c))));
}

const rgbToHex = (rgb) =>
  "#" +
  rgb
    .map((c) => Math.round(c * 255).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();

const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

/* ---------- ramp construction ---------- */

function buildRamp({ light, regular, dark }) {
  const L = rgbToOklab(hexToRgb(light));
  const R = rgbToOklab(hexToRgb(regular));
  const D = rgbToOklab(hexToRgb(dark));

  const out = {};

  // 100 / 500 / 800 are the spec's own values, verbatim.
  out[100] = light.toUpperCase();
  out[500] = regular.toUpperCase();
  out[800] = dark.toUpperCase();

  // 50: lift off the light anchor without bleaching it to paper white.
  out[50] = rgbToHex(oklabToRgb(mix(L, [Math.min(0.995, L[0] + 0.03), L[1] * 0.45, L[2] * 0.45], 1)));

  // 200-400 ride light -> regular, 600-700 ride regular -> dark.
  for (const [step, from, to, t] of [
    [200, L, R, 0.25],
    [300, L, R, 0.5],
    [400, L, R, 0.75],
    [600, R, D, 0.34],
    [700, R, D, 0.67],
  ]) {
    out[step] = rgbToHex(oklabToRgb(mix(from, to, t)));
  }

  // 900/950 continue past the dark anchor at the pace the 700->800 leg set,
  // easing chroma off so the deepest steps read as ink rather than as paint.
  const leg = rgbToOklab(hexToRgb(out[700]))[0] - D[0];
  for (const [step, n] of [[900, 1], [950, 1.7]]) {
    const l = Math.max(0.16, D[0] - leg * n);
    out[step] = rgbToHex(oklabToRgb([l, D[1] * (1 - 0.18 * n), D[2] * (1 - 0.18 * n)]));
  }

  return out;
}

/* ---------- emit ---------- */

const ramps = Object.fromEntries(
  Object.entries(ANCHORS).map(([name, anchors]) => [name, buildRamp(anchors)]),
);

let css = `/* GENERATED FILE - do not edit by hand.
 * Source of truth: scripts/generate-palette.mjs
 * Regenerate with: node scripts/generate-palette.mjs > src/styles/palette.css
 */

@theme {
`;

for (const [name, ramp] of Object.entries(ramps)) {
  css += `  /* ${name} */\n`;
  for (const step of STEPS) css += `  --color-${name}-${step}: ${ramp[step]};\n`;
  css += "\n";
}

css += "}\n";

process.stdout.write(css);
