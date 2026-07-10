/**
 * V2 problem import: build the problem bank from the public NeetCode 150 canon.
 *
 * The canon list (problem names, topics, difficulties) is fetched from
 * NeetCode's public GitHub data. Statements are then written ORIGINALLY by the
 * AI for each classic problem — no site's problem text is copied — and each
 * problem passes a self-verification call before insert. Source attribution is
 * stored on the row.
 *
 * Run:            npx tsx scripts/import-problems.ts
 * Wipe + reimport: npx tsx scripts/import-problems.ts --fresh
 *
 * Idempotent: slugs are derived from canon names, existing slugs are skipped,
 * so an interrupted run resumes where it left off.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { groqJson } from '../lib/groq';

try {
  process.loadEnvFile('.env.local');
} catch {
  // fall through to already-exported env vars
}

const CANON_URL =
  'https://raw.githubusercontent.com/neetcode-gh/leetcode/main/.problemSiteData.json';

const PATTERN_TO_TOPIC: Record<string, string> = {
  'Arrays & Hashing': 'arrays-hashing',
  'Two Pointers': 'two-pointers',
  'Sliding Window': 'sliding-window',
  Stack: 'stack',
  'Binary Search': 'binary-search',
  'Linked List': 'linked-list',
  Trees: 'trees',
  Tries: 'tries',
  'Heap / Priority Queue': 'heap',
  Backtracking: 'backtracking',
  Graphs: 'graphs',
  'Advanced Graphs': 'advanced-graphs',
  '1-D Dynamic Programming': 'dp-1d',
  '2-D Dynamic Programming': 'dp-2d',
  Greedy: 'greedy',
  Intervals: 'intervals',
  'Math & Geometry': 'math-geometry',
  'Bit Manipulation': 'bit-manipulation',
};

interface CanonEntry {
  problem: string;
  pattern: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  neetcode150?: boolean;
  blind75?: boolean;
}

const GENERATION_SYSTEM_PROMPT = `You are a technical interview problem designer. You will be given the NAME of a classic, widely-known algorithm interview problem plus its topic and difficulty. Write an ORIGINAL practice problem for it.

Rules:
- The problem must test the same algorithmic concept the classic is famous for, so someone who has seen the classic recognizes it by its behavior.
- Write every sentence yourself. Do NOT reproduce or closely paraphrase the wording of any existing website's problem statement. Fresh prose, your own example values.
- The statement must be self-contained and unambiguous: define the input, the output, and what to return. Use markdown. If duplicates or ordering could be ambiguous (e.g. unique triplets, result order), state the rule explicitly.
- Include 2–3 concrete examples with inputs, outputs, and a one-sentence explanation each. Example "input" and "output" fields are always STRINGS — stringify arrays and matrices, e.g. "[[1,2],[3,4]]".
- expected_approach.algorithm is a short kebab-case technique name, e.g. "topological-sort", "two-pointers", "simulation".
- Include specific constraints (input sizes, value ranges) consistent with the difficulty.
- expected_approach describes the canonical solution a senior engineer would give.
- hints: exactly 3 escalating hints. Hint 1 is a gentle nudge (what to notice). Hint 2 names the technique family without giving the algorithm. Hint 3 outlines the approach shape but stops short of full pseudocode. Never include code.
- Return valid JSON only. No commentary outside the JSON.`;

const GENERATION_JSON_SCHEMA: Record<string, unknown> = {
  type: 'object',
  properties: {
    title: { type: 'string' },
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
        // Free-form kebab-case: classics span more techniques than any enum
        // (topological-sort, simulation, inorder-traversal, ...).
        algorithm: { type: 'string' },
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
    hints: { type: 'array', minItems: 3, maxItems: 3, items: { type: 'string' } },
  },
  required: ['title', 'statement', 'examples', 'constraints', 'expected_approach', 'hints'],
  additionalProperties: false,
};

const VERIFICATION_SYSTEM_PROMPT = `You are a senior engineer reviewing a programming practice problem for quality. Check:
1. Is the problem statement unambiguous and self-contained?
2. Are the examples correct (outputs match the stated problem)?
3. Are the constraints realistic and consistent with the expected approach?
4. Is the expected_approach correct for the problem as stated?
5. Do the hints escalate gently without giving away code?

Minor stylistic issues are fine. Fail only for factual errors, ambiguity that changes the answer, or examples whose outputs are wrong.

Return JSON: { "pass": boolean, "issues": string[] }`;

const VERIFICATION_JSON_SCHEMA: Record<string, unknown> = {
  type: 'object',
  properties: {
    pass: { type: 'boolean' },
    issues: { type: 'array', items: { type: 'string' } },
  },
  required: ['pass', 'issues'],
  additionalProperties: false,
};

const generatedSchema = z.object({
  title: z.string().min(1),
  statement: z.string().min(80),
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
  hints: z.array(z.string()).length(3),
});

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchCanon(): Promise<{ name: string; topic: string; difficulty: string }[]> {
  const res = await fetch(CANON_URL);
  if (!res.ok) throw new Error(`Canon fetch failed: ${res.status}`);
  const raw = (await res.json()) as CanonEntry[];

  const entries = raw
    .filter((e) => e.neetcode150 || e.blind75)
    .map((e) => ({
      name: e.problem,
      topic: PATTERN_TO_TOPIC[e.pattern] ?? slugify(e.pattern),
      difficulty: e.difficulty.toLowerCase(),
    }))
    .filter((e) => ['easy', 'medium', 'hard'].includes(e.difficulty));

  // De-dup by name, keep canon order (grouped by pattern, easy→hard within).
  const seen = new Set<string>();
  return entries.filter((e) => (seen.has(e.name) ? false : (seen.add(e.name), true)));
}

async function ensureSchemaReady(db: SupabaseClient): Promise<void> {
  const { error } = await db.from('problems').select('hints, source').limit(1);
  if (error) {
    console.error(
      `The problems table is missing the V2 columns (hints, source): ${error.message}\n` +
        'Run supabase/migrations/20260710000006_hints_source.sql in the Supabase SQL editor first.'
    );
    process.exit(1);
  }
}

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || !process.env.GROQ_API_KEY) {
    console.error('Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or GROQ_API_KEY');
    process.exit(1);
  }
  const db = createClient(url, key, { auth: { persistSession: false } });

  await ensureSchemaReady(db);

  if (process.argv.includes('--fresh')) {
    console.log('--fresh: wiping evaluations and problems…');
    const { error: e1 } = await db.from('evaluations').delete().not('id', 'is', null);
    if (e1) console.error('  evaluations wipe failed:', e1.message);
    const { error: e2 } = await db.from('problems').delete().not('id', 'is', null);
    if (e2) {
      console.error('  problems wipe failed:', e2.message);
      process.exit(1);
    }
  }

  const canon = await fetchCanon();
  console.log(`Canon fetched: ${canon.length} problems (NeetCode 150 / Blind 75 union).`);

  const { data: existing, error: existingError } = await db.from('problems').select('slug');
  if (existingError) {
    console.error('Failed to read existing problems:', existingError.message);
    process.exit(1);
  }
  const existingSlugs = new Set((existing ?? []).map((r) => r.slug as string));
  console.log(`${existingSlugs.size} already in DB; importing the rest.\n`);

  let inserted = 0;
  let skipped = 0;
  let failed = 0;

  for (const [i, entry] of canon.entries()) {
    const slug = slugify(entry.name);
    const label = `[${i + 1}/${canon.length}] ${entry.difficulty}/${entry.topic} "${entry.name}"`;

    if (existingSlugs.has(slug)) {
      skipped++;
      continue;
    }

    let done = false;
    // Attempts 1-2 use the fast default model; attempt 3 escalates to the
    // strong reasoning model for classics whose semantics are hard to state.
    for (let attempt = 1; attempt <= 3 && !done; attempt++) {
      if (i > 0 || attempt > 1) await sleep(2000);
      try {
        const { data } = await groqJson<unknown>({
          system: GENERATION_SYSTEM_PROMPT,
          user: `Classic problem name: ${entry.name}\nTopic: ${entry.topic}\nDifficulty: ${entry.difficulty}\n\nWrite the original practice problem as JSON matching the schema.`,
          schemaName: 'problem_import',
          schema: GENERATION_JSON_SCHEMA,
          temperature: 0.7,
          maxTokens: attempt >= 3 ? 3500 : 4000,
          model: attempt >= 3 ? 'openai/gpt-oss-120b' : undefined,
          reasoningEffort: 'medium',
        });
        const problem = generatedSchema.parse(data);

        const { data: verdict } = await groqJson<{ pass: boolean; issues: string[] }>({
          system: VERIFICATION_SYSTEM_PROMPT,
          user: JSON.stringify(problem, null, 2),
          schemaName: 'problem_verification',
          schema: VERIFICATION_JSON_SCHEMA,
          temperature: 0,
        });
        if (!verdict.pass) {
          console.log(`${label} attempt ${attempt}: failed verification: ${verdict.issues.join(' | ')}`);
          continue;
        }

        const { error: insertError } = await db.from('problems').insert({
          slug,
          title: problem.title,
          difficulty: entry.difficulty,
          topics: [entry.topic],
          statement: problem.statement,
          examples: problem.examples,
          constraints: problem.constraints,
          expected_approach: problem.expected_approach,
          hints: problem.hints,
          source: {
            canon: 'NeetCode 150 / Blind 75',
            canon_url: 'https://neetcode.io/practice',
            note: 'Problem concept from the public canon list; statement written originally for Competitive Vibing.',
          },
        });
        if (insertError) {
          console.error(`${label}: insert failed: ${insertError.message}`);
          break;
        }

        existingSlugs.add(slug);
        inserted++;
        done = true;
        console.log(`${label}: ✓`);
      } catch (err) {
        console.error(`${label} attempt ${attempt}: ${err instanceof Error ? err.message : err}`);
      }
    }
    if (!done && !existingSlugs.has(slug)) failed++;
  }

  console.log(
    `\nDone. Inserted ${inserted}, already present ${skipped}, failed ${failed}, total in DB ${existingSlugs.size}.`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
