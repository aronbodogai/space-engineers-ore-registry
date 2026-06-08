import { test } from "node:test";
import assert from "node:assert/strict";
import { guessResource } from "./resources.js";

test("matches element symbols to resources", () => {
  assert.equal(guessResource("Ag"), "Silver");
  assert.equal(guessResource("fe"), "Iron");
  assert.equal(guessResource("U"), "Uranium");
  assert.equal(guessResource("mg"), "Magnesium");
  assert.equal(guessResource("pt"), "Platinum");
  assert.equal(guessResource("au"), "Gold");
  assert.equal(guessResource("ni"), "Nickel");
  assert.equal(guessResource("co"), "Cobalt");
  assert.equal(guessResource("si"), "Silicon");
});

test("matches plain ore names", () => {
  assert.equal(guessResource("ice"), "Ice");
  assert.equal(guessResource("Silver"), "Silver");
  assert.equal(guessResource("IRON"), "Iron");
  assert.equal(guessResource("stone"), "Stone");
  assert.equal(guessResource("rock"), "Stone");
});

test("is case-insensitive", () => {
  assert.equal(guessResource("aG"), "Silver");
  assert.equal(guessResource("ICE"), "Ice");
});

test("handles numbered repeat spots", () => {
  assert.equal(guessResource("Ag 2"), "Silver");
  assert.equal(guessResource("ag2"), "Silver");
  assert.equal(guessResource("U-3"), "Uranium");
  assert.equal(guessResource("Iron_4"), "Iron");
});

test("earliest matching token wins", () => {
  assert.equal(guessResource("Ag North"), "Silver");
  assert.equal(guessResource("Iron Silver"), "Iron");
});

test("returns null when nothing matches", () => {
  assert.equal(guessResource("Outpost Alpha"), null);
  assert.equal(guessResource("Base 1"), null);
  assert.equal(guessResource(""), null);
  assert.equal(guessResource("   "), null);
  assert.equal(guessResource(null), null);
  assert.equal(guessResource(123), null);
});
