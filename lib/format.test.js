import { test } from "node:test";
import assert from "node:assert/strict";
import { formatDistance } from "./format.js";

test("formatDistance shows whole meters under 1 km", () => {
  assert.equal(formatDistance(0), "0 m");
  assert.equal(formatDistance(840.4), "840 m");
  assert.equal(formatDistance(999), "999 m");
});

test("formatDistance shows one decimal of km at 1 km and up", () => {
  assert.equal(formatDistance(1000), "1 km");
  assert.equal(formatDistance(1500), "1.5 km");
  assert.equal(formatDistance(12400), "12.4 km");
});

test("formatDistance thousands-separates large distances", () => {
  assert.equal(formatDistance(2_500_000), "2,500 km");
});

test("formatDistance returns empty string for non-numeric input", () => {
  assert.equal(formatDistance(NaN), "");
  assert.equal(formatDistance(undefined), "");
  assert.equal(formatDistance("nope"), "");
});
