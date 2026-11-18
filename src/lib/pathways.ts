/** Illustrative pathways, not a published course catalogue. */
export type Pathway = {
  slug: string;
  title: string;
  description: string;
};

export const pathways: readonly Pathway[] = [
  {
    slug: "physics",
    title: "Physics & Measurement",
    description: "Explore forces, energy, physical quantities and practical measurement.",
  },
  {
    slug: "mathematics",
    title: "Applied Mathematics",
    description: "Build the mathematical foundations used in engineering and science.",
  },
  {
    slug: "computer-science",
    title: "Computer Science",
    description:
      "Learn computational thinking, programming and real-world problem-solving.",
  },
];
