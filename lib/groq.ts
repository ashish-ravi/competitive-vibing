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

export const GROQ_MODEL = 'llama-3.3-70b-versatile';

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

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: opts.model ?? GROQ_MODEL,
      temperature: opts.temperature ?? 0.2,
      max_tokens: opts.maxTokens ?? 2048,
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
    }),
  });

  if (!res.ok) {
    // Do not log the request body — it contains the user's explanation.
    throw new GroqUnavailableError(res.status, `Groq returned ${res.status}`);
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
