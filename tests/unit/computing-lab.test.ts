import { describe, expect, it } from "vitest";

import {
  type Gate,
  bitWeights,
  gateOutput,
  representByte,
  toggleBit,
  truthTable,
} from "@/lib/computing-lab";

describe("unsigned byte representation", () => {
  it("represents every valid byte without losing leading zeroes", () => {
    for (let n = 0; n <= 255; n++) {
      const result = representByte(n);
      expect(result.binary).toHaveLength(8);
      expect(result.hexadecimal).toHaveLength(2);
      expect(Number.parseInt(result.binary, 2)).toBe(n);
      expect(Number.parseInt(result.hexadecimal, 16)).toBe(n);
      expect(result.decimal).toBe(n);
    }
  });

  it("rejects invalid values", () => {
    for (const n of [-1, 256, 0.5, NaN, Infinity]) {
      expect(() => representByte(n)).toThrow(RangeError);
    }
  });

  it("toggles each place value independently", () => {
    for (const weight of bitWeights) {
      expect(toggleBit(0, weight)).toBe(weight);
      expect(toggleBit(weight, weight)).toBe(0);
    }
  });
});

describe("logic gates", () => {
  const cases: [Gate, number[]][] = [
    ["AND", [0, 0, 0, 1]],
    ["OR", [0, 1, 1, 1]],
    ["NAND", [1, 1, 1, 0]],
    ["NOR", [1, 0, 0, 0]],
    ["XOR", [0, 1, 1, 0]],
    ["NOT", [1, 0]],
  ];

  it.each(cases)("generates the %s truth table", (gate, expected) => {
    expect(truthTable(gate).map((row) => row.output)).toEqual(expected);
  });

  it("ignores the second input for NOT", () => {
    expect(gateOutput("NOT", 0, 1)).toBe(1);
    expect(gateOutput("NOT", 1, 1)).toBe(0);
  });
});
