export const bitWeights = [128, 64, 32, 16, 8, 4, 2, 1] as const;

export function toggleBit(value: number, weight: number): number {
  return value ^ weight;
}

export function representByte(value: number) {
  if (!Number.isInteger(value) || value < 0 || value > 255) {
    throw new RangeError("Expected an unsigned 8-bit integer.");
  }
  return {
    binary: value.toString(2).padStart(8, "0"),
    hexadecimal: value.toString(16).toUpperCase().padStart(2, "0"),
    decimal: value,
  };
}

export const gates = ["AND", "OR", "NOT", "NAND", "NOR", "XOR"] as const;
export type Gate = (typeof gates)[number];
export type Bit = 0 | 1;

export function gateOutput(gate: Gate, a: Bit, b: Bit): Bit {
  switch (gate) {
    case "AND":
      return a && b;
    case "OR":
      return a || b;
    case "NOT":
      return a === 0 ? 1 : 0;
    case "NAND":
      return a && b ? 0 : 1;
    case "NOR":
      return a || b ? 0 : 1;
    case "XOR":
      return a === b ? 0 : 1;
  }
}

export function truthTable(gate: Gate) {
  const inputs: [Bit, Bit][] =
    gate === "NOT"
      ? [
          [0, 0],
          [1, 0],
        ]
      : [
          [0, 0],
          [0, 1],
          [1, 0],
          [1, 1],
        ];
  return inputs.map(([a, b]) => ({ a, b, output: gateOutput(gate, a, b) }));
}

export const binaryQuestions = [
  { prompt: "What is 00001101 in decimal?", options: ["11", "13", "15"], answer: 1 },
  {
    prompt: "Which binary number represents 42?",
    options: ["00101010", "00100110", "00101100"],
    answer: 0,
  },
  { prompt: "What is 11111111 in hexadecimal?", options: ["F0", "0F", "FF"], answer: 2 },
] as const;

export const gateQuestions = [
  { prompt: "AND: A = 1, B = 0. What is the output?", options: ["0", "1"], answer: 0 },
  { prompt: "NOT: A = 0. What is the output?", options: ["0", "1"], answer: 1 },
  { prompt: "XOR: A = 1, B = 1. What is the output?", options: ["0", "1"], answer: 0 },
] as const;
