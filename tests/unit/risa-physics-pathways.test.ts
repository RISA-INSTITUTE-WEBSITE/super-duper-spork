import { describe, expect, it } from "vitest";

import {
  describePhysicsPackage,
  findPhysicsPathway,
  physicsModules,
  physicsPathwayHref,
  physicsPathways,
} from "../../src/lib/risa-physics-pathways";

describe("Applied Physics curriculum preview", () => {
  it("preserves all twelve pathway identifiers and titles", () => {
    expect(physicsPathways.map((p) => p.code)).toEqual(
      Array.from({ length: 12 }, (_, i) => "AP" + String(i + 1).padStart(2, "0")),
    );
    expect(physicsPathways.every((p) => p.title.startsWith("Applied Physics in "))).toBe(
      true,
    );
    expect(findPhysicsPathway("ap09")?.packages.PHY303).toBe("Q6");
    expect(findPhysicsPathway("ap99")).toBeUndefined();
    expect(physicsPathwayHref("AP01")).toBe("/programmes/physics/pathways/ap01");
  });

  it("keeps a single shared module register and optional PHY304", () => {
    expect(new Set(physicsModules.map((m) => m.code)).size).toBe(21);
    expect(
      [1, 2, 3].map((level) => physicsModules.filter((m) => m.level === level).length),
    ).toEqual([6, 7, 8]);
    expect(physicsModules.filter((m) => m.optional).map((m) => m.code)).toEqual([
      "PHY304",
    ]);
  });

  it("interprets reused package codes by module", () => {
    expect(describePhysicsPackage("PHY202", "H1")).toBe(
      "Electromagnetic energy conversion",
    );
    expect(describePhysicsPackage("PHY203 specialisation", "H1")).toBe(
      "Optical fibres and communications",
    );
    expect(describePhysicsPackage("PHY304", "H1")).toBe("Theoretical Mechanics");
    expect(describePhysicsPackage("PHY304", "—")).toBe("No default recommendation");
  });
});
