export const labDomains = [
  {
    slug: "computing",
    title: "Computing Lab",
    code: "CS101",
    description: "Explore binary representation and digital logic gates.",
    href: "/computing-lab",
    activities: ["Binary foundations", "Digital logic gates"],
  },
  {
    slug: "physics",
    title: "Physics Lab",
    code: "PHY101",
    description: "Investigate motion and Newton's second law.",
    href: "/labs/physics",
    activities: ["Motion on a straight track", "Force and acceleration"],
  },
  {
    slug: "devops",
    title: "Cloud & DevOps Lab",
    code: "DVE201",
    description: "Experiment with a simulated continuous delivery pipeline.",
    href: "/labs/devops",
    activities: ["Build, test and deploy"],
  },
  {
    slug: "security",
    title: "Ethical Hacking Lab",
    code: "COMS101",
    description: "Practice defensive security decisions in a fictional system.",
    href: "/labs/security",
    activities: ["Least privilege access control"],
  },
] as const;

export function straightTrackMotion(speed: number, acceleration: number, time: number) {
  return {
    distance: speed * time + 0.5 * acceleration * time ** 2,
    velocity: speed + acceleration * time,
  };
}

export function accelerationFromForce(force: number, mass: number): number {
  if (!Number.isFinite(mass) || mass <= 0) {
    throw new RangeError("Mass must be positive.");
  }
  return force / mass;
}

export type PipelineStage = "Build" | "Test" | "Deploy";
export type StageStatus = "passed" | "failed" | "blocked";
export type PipelineResult = { stage: PipelineStage; status: StageStatus };

export function simulatePipeline(buildPasses: boolean, testsPass: boolean): PipelineResult[] {
  return [
    { stage: "Build", status: buildPasses ? "passed" : "failed" },
    { stage: "Test", status: testStatus(buildPasses, testsPass) },
    { stage: "Deploy", status: buildPasses && testsPass ? "passed" : "blocked" },
  ];
}

function testStatus(buildPasses: boolean, testsPass: boolean): StageStatus {
  if (!buildPasses) {
    return "blocked";
  }
  return testsPass ? "passed" : "failed";
}

export const accessScenarios = [
  {
    task: "A learner needs to read a published study note.",
    required: "Read",
    explanation: "Reading does not require permission to edit or administer the system.",
  },
  {
    task: "An editor needs to update a shared study note.",
    required: "Edit",
    explanation: "Editing is sufficient; administrator access is unnecessary.",
  },
  {
    task: "An authorized administrator must manage account roles.",
    required: "Admin",
    explanation: "Role management requires administrator authorization.",
  },
] as const;

export const accessRoles = ["Read", "Edit", "Admin"] as const;
export type AccessRole = (typeof accessRoles)[number];

export function evaluateAccess(required: AccessRole, chosen: AccessRole) {
  const difference = accessRoles.indexOf(chosen) - accessRoles.indexOf(required);
  if (difference < 0) {
    return "insufficient";
  }
  return difference === 0 ? "correct" : "excessive";
}
