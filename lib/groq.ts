/**
 * Groq API wrapper. Server-side only — GROQ_API_KEY never reaches the client.
 *
 * All calls use response_format json_schema (non-negotiable #5). The client-
 * facing "streaming" contract is fulfilled by the API routes re-emitting the
 * parsed result as NDJSON chunks (see docs/prompts/evaluate-system.md,
 * "Streaming Strategy") — the full JSON must be buffered before it can be
 * parsed either way, so the Groq call itself is a single completion request.
 */

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Default model. Env-overridable (GROQ_MODEL) so model swaps need no code change
 * — Groq deprecates models periodically.
 *
 * Must be a model that supports `response_format: json_schema` (non-negotiable
 * #5). NOTE: llama-3.3-70b-versatile does NOT — it only supports json_object.
 * gpt-oss-120b supports json_schema but has just 8k TPM on the free tier
 * (too small for one full request), so llama-4-scout (30k TPM) is the default.
 * See: https://console.groq.com/docs/structured-outputs#supported-models
 */
export const GROQ_MODEL =
  process.env.GROQ_MODEL?.trim() || 'meta-llama/llama-4-scout-17b-16e-instruct';

/** gpt-oss models are reasoning models that accept a reasoning_effort knob. */
function isReasoningModel(model: string): boolean {
  return model.includes('gpt-oss');
}

/** Parse a Retry-After header (seconds); fall back to a short default. */
function parseRetryAfter(header: string | null): number {
  const parsed = header ? Number.parseFloat(header) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 3;
}

export class GroqUnavailableError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'GroqUnavailableError';
  }
}

/**
 * Sanitize user-originated text before it enters any AI prompt
 * (.claude/rules/security.md): truncate as defense-in-depth on top of the
 * Zod max-length check, and strip angle brackets to prevent tag injection
 * into structured prompts. Applies to explanations AND interview answers.
 */
export function sanitizeUserText(text: string, maxLength = 1500): string {
  return text.slice(0, maxLength).replace(/[<>]/g, '');
}

export interface GroqJsonCallOptions {
  system: string;
  user: string;
  schemaName: string;
  schema: Record<string, unknown>;
  temperature?: number;
  maxTokens?: number;
  model?: string;
  /** Only applied to reasoning models (gpt-oss). Default 'medium'. */
  reasoningEffort?: 'low' | 'medium' | 'high';
}

export interface GroqJsonResult<T> {
  data: T;
  tokensUsed: number | null;
}

/**
 * Single JSON-schema-constrained completion. Throws GroqUnavailableError on
 * any non-200 (mapped to 503 AI_UNAVAILABLE at the route layer) and on an
 * unparseable body.
 */
export async function groqJson<T>(opts: GroqJsonCallOptions): Promise<GroqJsonResult<T>> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new GroqUnavailableError(500, 'GROQ_API_KEY is not configured');
  }

  const model = opts.model ?? GROQ_MODEL;
  const requestBody: Record<string, unknown> = {
    model,
    temperature: opts.temperature ?? 0.2,
    // Groq reserves prompt + max_completion_tokens against the per-minute token
    // budget, so an oversized cap can exceed the whole TPM limit (413). Keep it
    // just large enough for the JSON output; reasoning models need more headroom.
    max_completion_tokens: opts.maxTokens ?? (isReasoningModel(model) ? 8192 : 4096),
    messages: [
      { role: 'system', content: opts.system },
      { role: 'user', content: opts.user },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: opts.schemaName,
        strict: true,
        schema: opts.schema,
      },
    },
  };
  if (isReasoningModel(model)) {
    requestBody.reasoning_effort = opts.reasoningEffort ?? 'medium';
  }

  let res: Response | null = null;
  // Retry transient per-minute rate limits (429) a couple of times, honoring
  // Groq's suggested wait. Other non-200s fail fast.
  for (let attempt = 0; attempt < 3; attempt++) {
    res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (res.status !== 429 || attempt === 2) break;
    const waitSec = parseRetryAfter(res.headers.get('retry-after'));
    await new Promise((r) => setTimeout(r, Math.min(waitSec, 10) * 1000));
  }

  if (!res || !res.ok) {
    // Surface Groq's own validation message (safe — it never echoes the user's
    // explanation), but never log the request body.
    let detail = '';
    try {
      const errBody = (await res!.json()) as { error?: { message?: string } };
      detail = errBody.error?.message ? `: ${errBody.error.message}` : '';
    } catch {
      // non-JSON error body
    }
    throw new GroqUnavailableError(res?.status ?? 502, `Groq returned ${res?.status ?? 502}${detail}`);
  }

  const body = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
    usage?: { total_tokens?: number };
  };

  const content = body.choices?.[0]?.message?.content;
  if (!content) {
    throw new GroqUnavailableError(502, 'Groq returned an empty completion');
  }

  let data: T;
  try {
    data = JSON.parse(content) as T;
  } catch {
    throw new GroqUnavailableError(502, 'Groq returned unparseable JSON');
  }

  return { data, tokensUsed: body.usage?.total_tokens ?? null };
}
