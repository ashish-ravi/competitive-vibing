/**
 * The learning path: topics ordered the way a beginner should meet them.
 * Progression mirrors the well-known community roadmap (each stage builds
 * on the techniques of the previous one).
 */

export interface RoadmapStage {
  level: number;
  title: string;
  blurb: string;
  topics: string[];
}

export const ROADMAP_STAGES: RoadmapStage[] = [
  {
    level: 1,
    title: 'Foundations',
    blurb: 'Fast lookups and array fluency — every later pattern stands on this.',
    topics: ['arrays-hashing'],
  },
  {
    level: 2,
    title: 'Pointer discipline',
    blurb: 'Move through data deliberately instead of re-scanning it.',
    topics: ['two-pointers', 'stack'],
  },
  {
    level: 3,
    title: 'Windows & halving',
    blurb: 'Shrink the search space: slide a window, cut the range, walk the links.',
    topics: ['sliding-window', 'binary-search', 'linked-list'],
  },
  {
    level: 4,
    title: 'Hierarchies',
    blurb: 'Recursion becomes structure. Trees are where interviews get serious.',
    topics: ['trees'],
  },
  {
    level: 5,
    title: 'Branch & explore',
    blurb: 'Prefix trees, priority queues, and brute force under control.',
    topics: ['tries', 'heap', 'backtracking'],
  },
  {
    level: 6,
    title: 'Networks & choices',
    blurb: 'Traverse relationships and make provably good picks.',
    topics: ['graphs', 'dp-1d', 'intervals', 'greedy'],
  },
  {
    level: 7,
    title: 'End game',
    blurb: 'The heavy artillery for hard rounds.',
    topics: ['advanced-graphs', 'dp-2d', 'bit-manipulation', 'math-geometry'],
  },
];

export interface RoadmapTopic {
  topic: string;
  label: string;
  solved: number;
  total: number;
}

/** Merge stage config with per-topic progress; append any unmapped topics. */
export function buildRoadmap(topics: RoadmapTopic[]): {
  stages: (RoadmapStage & { items: RoadmapTopic[]; complete: boolean })[];
  currentLevel: number;
} {
  const byTopic = new Map(topics.map((t) => [t.topic, t]));
  const mapped = new Set<string>();

  const stages = ROADMAP_STAGES.map((stage) => {
    const items = stage.topics
      .map((t) => {
        mapped.add(t);
        return byTopic.get(t);
      })
      .filter((t): t is RoadmapTopic => Boolean(t && t.total > 0));
    return {
      ...stage,
      items,
      complete: items.length > 0 && items.every((t) => t.solved >= t.total),
    };
  }).filter((s) => s.items.length > 0);

  const unmapped = topics.filter((t) => !mapped.has(t.topic) && t.total > 0);
  if (unmapped.length > 0) {
    stages.push({
      level: stages.length + 1,
      title: 'Off the map',
      blurb: 'Topics beyond the classic path.',
      topics: unmapped.map((t) => t.topic),
      items: unmapped,
      complete: unmapped.every((t) => t.solved >= t.total),
    });
  }

  const current = stages.find((s) => !s.complete);
  return { stages, currentLevel: current?.level ?? stages.length };
}
