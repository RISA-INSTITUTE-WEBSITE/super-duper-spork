import { describe, expect, it } from "vitest";

import {
  accelerationFromForce,
  accessRoles,
  accessScenarios,
  evaluateAccess,
  labDomains,
  simulatePipeline,
  straightTrackMotion,
} from "@/lib/risa-virtual-labs";

describe("RISA virtual laboratories", () => {
  it("provides four distinct lab routes", () => {
    expect(labDomains).toHaveLength(4);
    expect(new Set(labDomains.map((item) => item.href)).size).toBe(4);
  });

  it("calculates constant acceleration motion", () => {
    expect(straightTrackMotion(2, 1, 5)).toEqual({ distance: 22.5, velocity: 7 });
    expect(straightTrackMotion(10, 10, 10)).toEqual({ distance: 600, velocity: 110 });
    expect(straightTrackMotion(4, 0, 3)).toEqual({ distance: 12, velocity: 4 });
  });

  it("calculates Newton's second law and rejects invalid mass", () => {
    expect(accelerationFromForce(10, 2)).toBe(5);
    expect(accelerationFromForce(10, 4)).toBe(2.5);
    expect(accelerationFromForce(0, 4)).toBe(0);
    for (const mass of [0, -1, NaN, Infinity]) {
      expect(() => accelerationFromForce(10, mass)).toThrow(RangeError);
    }
  });

  it("blocks delivery whenever build or tests fail", () => {
    for (const tests of [false, true]) {
      expect(simulatePipeline(false, tests).map((item) => item.status)).toEqual([
        "failed",
        "blocked",
        "blocked",
      ]);
    }
    expect(simulatePipeline(true, false).map((item) => item.status)).toEqual([
      "passed",
      "failed",
      "blocked",
    ]);
    expect(simulatePipeline(true, true).map((item) => item.status)).toEqual([
      "passed",
      "passed",
      "passed",
    ]);
  });

  it("distinguishes necessary, excessive and insufficient permissions", () => {
    for (const scenario of accessScenarios) {
      expect(evaluateAccess(scenario.required, scenario.required)).toBe("correct");
    }
    expect(evaluateAccess("Read", "Admin")).toBe("excessive");
    expect(evaluateAccess("Admin", "Read")).toBe("insufficient");
    expect(accessRoles).toEqual(["Read", "Edit", "Admin"]);
  });
});
