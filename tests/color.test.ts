/**
 * Club colour contrast.
 *
 * The product lets clubs pick any brand colour, so the one thing that must
 * never happen is a hardcoded assumption about its luminance. These cover the
 * whole range - near-black to near-white, plus the saturated colours a club
 * will eventually choose.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  clubThemeTokens,
  contrastRatio,
  foregroundFor,
  isDark,
  parseHex,
  readableOnSurface,
  softTint,
} from "../src/lib/color.ts";

const PAPER = parseHex("#FCFBF7")!;
const AA = 4.5;

const CLUB_COLOURS = [
  ["near-black", "#0A0A0A"],
  ["dark green", "#304832"],
  ["divotz green", "#5E765A"],
  ["mid blue", "#6F8E9E"],
  ["sand", "#D6C19B"],
  ["neon orange", "#FF6B00"],
  ["pale yellow", "#FFF7B0"],
  ["near-white", "#FEFEFE"],
] as const;

test("every club colour gets a foreground that clears WCAG AA", () => {
  for (const [name, hex] of CLUB_COLOURS) {
    const tokens = clubThemeTokens({ primary: hex });
    const ratio = contrastRatio(
      parseHex(tokens["--club-primary"])!,
      parseHex(tokens["--club-primary-foreground"])!,
    );
    assert.ok(ratio >= AA, `${name} (${hex}) only reached ${ratio.toFixed(2)}:1 on its foreground`);
  }
});

test("dark colours get light text and light colours get dark text", () => {
  assert.equal(foregroundFor("#0A0A0A"), "#FCFBF7", "near-black needs light text");
  assert.equal(foregroundFor("#304832"), "#FCFBF7", "dark green needs light text");
  assert.equal(foregroundFor("#FFF7B0"), "#1E211E", "pale yellow needs dark text");
  assert.equal(foregroundFor("#FEFEFE"), "#1E211E", "near-white needs dark text");
});

test("a club colour used as text is darkened until it is readable on cream", () => {
  for (const [name, hex] of CLUB_COLOURS) {
    const readable = readableOnSurface(hex);
    const ratio = contrastRatio(parseHex(readable)!, PAPER);
    assert.ok(
      ratio >= AA,
      `${name} (${hex}) as text reached only ${ratio.toFixed(2)}:1 against cream`,
    );
  }
});

test("a colour already dark enough is left alone", () => {
  // Darkening a colour that already passes would shift a club's brand for no
  // reason, so the guard has to be a no-op in the common case.
  assert.equal(readableOnSurface("#304832"), "#304832");
});

test("invalid or missing colours fall back instead of throwing", () => {
  const tokens = clubThemeTokens({ primary: "not-a-colour", secondary: null });
  assert.equal(tokens["--club-primary"], "#5E765A", "falls back to the Divotz green");
  assert.equal(tokens["--club-secondary"], "#6F8E9E");
  assert.equal(clubThemeTokens(null)["--club-primary"], "#5E765A");
});

test("hex parsing handles shorthand, casing and a missing hash", () => {
  assert.deepEqual(parseHex("#FFF"), { r: 255, g: 255, b: 255 });
  assert.deepEqual(parseHex("5e765a"), parseHex("#5E765A"));
  assert.equal(parseHex("#12345"), null);
  assert.equal(parseHex("rgb(1,2,3)"), null);
});

test("soft tints stay inside the warm palette rather than going pastel-blue", () => {
  const tint = parseHex(softTint("#304832"))!;
  assert.ok(tint.r > 200 && tint.g > 200 && tint.b > 200, "a tint should be a pale wash");
  assert.ok(isDark("#304832") && !isDark("#F1E9D7"));
});
