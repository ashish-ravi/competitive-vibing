/**
 * Seed the problems table with AI-generated problems via Groq.
 * Run: npx tsx scripts/seed-problems.ts
 *
 * Each problem goes through a self-verification pass (a second Groq call
 * reviews it); only problems that pass are inserted. Idempotent by slug.
 * Uses the service role key — server-side script only.
 * Spec: docs/prompts/generate-problem.md
 */

import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { groqJson } from '../lib/groq';

try {
  process.loadEnvFile('.env.local');
} catch {
  // fall through to already-exported env vars
}

const GENERATION_SYSTEM_PROMPT = `You are a technical interview problem designer creating high-quality algorithm practice problems.

Each problem must:
- Be solvable with a known algorithm pattern (hash map, two pointers, sliding window, BFS/DFS, DP, binary search, etc.)
- Have a clear, unambiguous problem statement
- Include 2–3 concrete examples with inputs, outputs, and brief explanation
- Include specific constraints (input size, value ranges, edge case definitions)
- Have a well-defined expected approach that a senior engineer would consider canonical

Do not create problems that:
- Require language-specific APIs
- Depend on mathematical number theory beyond basic modular arithmetic
- Are ambiguous about whether duplicates or negative numbers are allowed
- Have multiple significantly different optimal approaches (pick the simpler one as canonical)

Return valid JSON only. No commentary outside the JSON.`;

const VERIFICATION_SYSTEM_PROMPT = `You are a senior engineer reviewing a programming problem for quality. Check:
1. Is the problem statement unambiguous?
2. Are the examples correct (do the outputs match the stated problem)?
3. Are the constraints realistic and consistent with the expected approach?
4. Is the expected_approach actually correct and optimal?
5. Are the critical_edge_cases genuine and relevant?

Return JSON: { "pass": boolean, "issues": string[] }`;

const GENERATION_JSON_SCHEMA: Record<string, unknown> = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    slug: { type: 'string', pattern: '^[a-z0-9-]+$' },
    difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
    topics: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 3 },
    statement: { type: 'string' },
    examples: {
      type: 'array',
      minItems: 2,
      maxItems: 3,
      items: {
        type: 'object',
        properties: {
          input: { type: 'string' },
          output: { type: 'string' },
          explanation: { type: 'string' },
        },
        required: ['input', 'output', 'explanation'],
        additionalProperties: false,
      },
    },
    constraints: { type: 'array', minItems: 2, items: { type: 'string' } },
    expected_approach: {
      type: 'object',
      properties: {
        summary: { type: 'string' },
        algorithm: {
          type: 'string',
          enum: [
            'hash-map',
            'two-pointers',
            'sliding-window',
            'bfs',
            'dfs',
            'dynamic-programming',
            'binary-search',
            'sorting',
            'stack',
            'heap',
            'greedy',
            'recursion',
            'other',
          ],
        },
        time_complexity: { type: 'string' },
        space_complexity: { type: 'string' },
        key_insight: { type: 'string' },
        critical_edge_cases: { type: 'array', items: { type: 'string' } },
      },
      required: [
        'summary',
        'algorithm',
        'time_complexity',
        'space_complexity',
        'key_insight',
        'critical_edge_cases',
      ],
      additionalProperties: false,
    },
  },
  required: [
    'title',
    'slug',
    'difficulty',
    'topics',
    'statement',
    'examples',
    'constraints',
    'expected_approach',
  ],
  additionalProperties: false,
};

const VERIFICATION_JSON_SCHEMA: Record<string, unknown> = {
  type: 'object',
  properties: {
    pass: { type: 'boolean' },
    issues: { type: 'array', items: { type: 'string' } },
  },
  required: ['pass', 'issues'],
  additionalProperties: false,
};

const generatedProblemSchema = z.object({
  title: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/).max(100),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  topics: z.array(z.string()).min(1).max(3),
  statement: z.string().min(50),
  examples: z
    .array(z.object({ input: z.string(), output: z.string(), explanation: z.string() }))
    .min(2)
    .max(3),
  constraints: z.array(z.string()).min(2),
  expected_approach: z.object({
    summary: z.string(),
    algorithm: z.string(),
    time_complexity: z.string(),
    space_complexity: z.string(),
    key_insight: z.string(),
    critical_edge_cases: z.array(z.string()),
  }),
});

type GeneratedProblem = z.infer<typeof generatedProblemSchema>;

// Distribution per docs/prompts/generate-problem.md
const SEED_PLAN: { difficulty: 'easy' | 'medium' | 'hard'; topic: string }[] = [
  ...Array<string>(3).fill('arrays').map((topic) => ({ difficulty: 'easy' as const, topic })),
  ...Array<string>(2).fill('strings').map((topic) => ({ difficulty: 'easy' as const, topic })),
  ...Array<string>(2).fill('hash-map').map((topic) => ({ difficulty: 'easy' as const, topic })),
  { difficulty: 'easy', topic: 'two-pointers' },
  ...Array<string>(2).fill('arrays').map((topic) => ({ difficulty: 'medium' as const, topic })),
  ...Array<string>(2).fill('trees').map((topic) => ({ difficulty: 'medium' as const, topic })),
  ...Array<string>(2)
    .fill('dynamic-programming')
    .map((topic) => ({ difficulty: 'medium' as const, topic })),
  { difficulty: 'medium', topic: 'graphs' },
  ...Array<string>(2)
    .fill('sliding-window')
    .map((topic) => ({ difficulty: 'medium' as const, topic })),
  { difficulty: 'hard', topic: 'dynamic-programming' },
  { difficulty: 'hard', topic: 'graphs' },
  { difficulty: 'hard', topic: 'binary-search' },
];

const MAX_GENERATION_ATTEMPTS = 3;

async function generateProblem(
  difficulty: string,
  topic: string,
  existingSlugs: string[]
): Promise<GeneratedProblem> {
  const { data } = await groqJson<unknown>({
    system: GENERATION_SYSTEM_PROMPT,
    user: `Generate a ${difficulty} algorithm problem on the topic of ${topic}.

The problem must not be identical to these already-generated slugs: ${existingSlugs.join(', ') || '(none)'}.

Return a JSON object matching this schema exactly.`,
    schemaName: 'problem_generation',
    schema: GENERATION_JSON_SCHEMA,
    temperature: 0.8,
    maxTokens: 3000,
  });
  return generatedProblemSchema.parse(data);
}

async function verifyProblem(problem: GeneratedProblem): Promise<{ pass: boolean; issues: string[] }> {
  const { data } = await groqJson<{ pass: boolean; issues: string[] }>({
    system: VERIFICATION_SYSTEM_PROMPT,
    user: JSON.stringify(problem, null, 2),
    schemaName: 'problem_verification',
    schema: VERIFICATION_JSON_SCHEMA,
    temperature: 0,
  });
  return data;
}

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || !process.env.GROQ_API_KEY) {
    console.error('Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or GROQ_API_KEY');
    process.exit(1);
  }
  const db = createClient(url, key, { auth: { persistSession: false } });

  const { data: existing, error: existingError } = await db.from('problems').select('slug');
  if (existingError) {
    console.error('Failed to read existing problems:', existingError.message);
    process.exit(1);
  }
  const existingSlugs = (existing ?? []).map((r) => r.slug as string);
  console.log(`${existingSlugs.length} problems already seeded.`);

  let inserted = 0;
  let skipped = 0;

  for (const [i, spec] of SEED_PLAN.entries()) {
    const label = `[${i + 1}/${SEED_PLAN.length}] ${spec.difficulty}/${spec.topic}`;
    let done = false;

    for (let attempt = 1; attempt <= MAX_GENERATION_ATTEMPTS && !done; attempt++) {
      try {
        const problem = await generateProblem(spec.difficulty, spec.topic, existingSlugs);

        if (existingSlugs.includes(problem.slug)) {
          console.log(`${label} attempt ${attempt}: slug "${problem.slug}" already exists, regenerating`);
          continue;
        }

        const verification = await verifyProblem(problem);
        if (!verification.pass) {
          console.log(
            `${label} attempt ${attempt}: "${problem.title}" failed verification:\n  - ${verification.issues.join('\n  - ')}`
          );
          continue;
        }

        const { error: insertError } = await db.from('problems').insert({
          slug: problem.slug,
          title: problem.title,
          difficulty: problem.difficulty,
          topics: problem.topics,
          statement: problem.statement,
          examples: problem.examples,
          constraints: problem.constraints,
          expected_approach: problem.expected_approach,
        });
        if (insertError) {
          console.error(`${label}: insert failed: ${insertError.message}`);
          break;
        }

        existingSlugs.push(problem.slug);
        inserted++;
        done = true;
        console.log(`${label}: ✓ inserted "${problem.title}" (${problem.slug})`);
      } catch (err) {
        console.error(`${label} attempt ${attempt}: ${err instanceof Error ? err.message : err}`);
      }
    }

    if (!done) {
      skipped++;
      console.log(`${label}: ✗ gave up after ${MAX_GENERATION_ATTEMPTS} attempts`);
    }
  }

  console.log(`\nDone. Inserted ${inserted}, skipped ${skipped}, total in DB ${existingSlugs.length}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
