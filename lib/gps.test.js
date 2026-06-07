import { test } from "node:test";
import assert from "node:assert/strict";
import { parseGps, formatGps, distance3d } from "./gps.js";

test("parses the canonical spec example", () => {
  const raw =
    "GPS:ICE_9:79138.9433054972:253235.787713332:-760016.753826463:#FF75C9F1:";
  const r = parseGps(raw);
  assert.equal(r.ok, true);
  assert.equal(r.value.name, "ICE_9");
  assert.equal(r.value.x, 79138.9433054972);
  assert.equal(r.value.y, 253235.787713332);
  assert.equal(r.value.z, -760016.753826463);
  assert.equal(r.value.color, "#FF75C9F1");
  assert.equal(r.value.gps_raw, raw);
});

test("handles negative coordinates", () => {
  const r = parseGps("GPS:Spot:-1:-2.5:-3:#FFFFFFFF:");
  assert.equal(r.ok, true);
  assert.deepEqual([r.value.x, r.value.y, r.value.z], [-1, -2.5, -3]);
});

test("color is optional", () => {
  const r = parseGps("GPS:NoColor:1:2:3:");
  assert.equal(r.ok, true);
  assert.equal(r.value.color, null);
});

test("trims surrounding whitespace and keeps raw trimmed", () => {
  const r = parseGps("  GPS:Pad:1:2:3:#FF000000:  ");
  assert.equal(r.ok, true);
  assert.equal(r.value.gps_raw, "GPS:Pad:1:2:3:#FF000000:");
});

test("accepts lowercase gps prefix", () => {
  const r = parseGps("gps:lower:1:2:3:");
  assert.equal(r.ok, true);
  assert.equal(r.value.name, "lower");
});

test("rejects empty input", () => {
  assert.equal(parseGps("").ok, false);
  assert.equal(parseGps("   ").ok, false);
  assert.equal(parseGps(null).ok, false);
});

test("rejects strings that do not start with GPS:", () => {
  const r = parseGps("LOC:Thing:1:2:3:");
  assert.equal(r.ok, false);
  assert.match(r.error, /start with "GPS:"/);
});

test("rejects missing coordinates", () => {
  assert.equal(parseGps("GPS:OnlyName:").ok, false);
  assert.equal(parseGps("GPS:Two:1:2:").ok, false);
});

test("rejects non-numeric coordinates", () => {
  const r = parseGps("GPS:Bad:one:two:three:");
  assert.equal(r.ok, false);
  assert.match(r.error, /numeric coordinates/);
});

test("rejects missing name", () => {
  const r = parseGps("GPS::1:2:3:");
  assert.equal(r.ok, false);
});

test("formatGps round-trips coordinates", () => {
  const r = parseGps("GPS:RT:10:20:30:#FF112233:");
  assert.equal(formatGps(r.value), "GPS:RT:10:20:30:#FF112233:");
});

test("formatGps supplies a default color when missing", () => {
  assert.equal(
    formatGps({ name: "X", x: 1, y: 2, z: 3, color: null }),
    "GPS:X:1:2:3:#FFFFFFFF:"
  );
});

test("distance3d matches the 5 km near-duplicate rule", () => {
  // 3-4-5 triangle scaled: distance should be exactly 5000.
  const d = distance3d({ x: 0, y: 0, z: 0 }, { x: 3000, y: 4000, z: 0 });
  assert.equal(d, 5000);
  assert.ok(distance3d({ x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1 }) < 5000);
});
