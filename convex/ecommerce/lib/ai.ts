/**
 * Claude API layer used by every AI-powered action in the platform.
 *
 * All generation goes through `withAi`, which falls back to deterministic
 * templates when no ANTHROPIC_API_KEY is configured (or the API fails), so the
 * whole product keeps working in a "demo mode" and the UI can flag which
 * results were produced by the model and which by templates.
 */
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import type { z } from "zod";
import type { Doc } from "../../_generated/dataModel";

export const AI_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-5";
const FALLBACK_BETA = "server-side-fallback-2026-07-01";

export function aiEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) client = new Anthropic();
  return client;
}

export interface AiSource {
  title: string;
  url: string;
}

export const OPERATOR_SYSTEM = `You are the AI operator behind an ecommerce automation platform. You help online store owners find products, build stores, run marketing and manage fulfilment.
Write in a clear, commercially sharp voice. Be specific: real numbers, concrete angles, no filler. Never invent supplier names or fake statistics; when you estimate, say so briefly in the field that holds the estimate.`;

export function storeContext(store: Doc<"ecStores">): string {
  return [
    `Store: ${store.name}`,
    `Niche: ${store.niche}`,
    store.description ? `About: ${store.description}` : null,
    store.targetAudience ? `Target audience: ${store.targetAudience}` : null,
    store.brandVoice ? `Brand voice: ${store.brandVoice}` : null,
    `Currency: ${store.currency}`,
    store.country ? `Primary market: ${store.country}` : null,
    `Pricing strategy: ${store.pricing.strategy}, target net margin ${store.pricing.targetMarginPct}%`,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Ask Claude for a JSON object that matches a zod schema (structured outputs).
 */
export async function generateStructured<S extends z.ZodType>(opts: {
  system?: string;
  prompt: string;
  schema: S;
  effort?: "low" | "medium" | "high";
  maxTokens?: number;
}): Promise<z.infer<S>> {
  const response = await getClient().beta.messages.parse({
    model: AI_MODEL,
    max_tokens: opts.maxTokens ?? 16000,
    betas: [FALLBACK_BETA],
    fallbacks: "default",
    system: opts.system ?? OPERATOR_SYSTEM,
    output_config: {
      format: betaZodOutputFormat(opts.schema),
      effort: opts.effort ?? "medium",
    },
    messages: [{ role: "user", content: opts.prompt }],
  });
  if (response.stop_reason === "refusal") {
    throw new Error("The model declined this request.");
  }
  if (!response.parsed_output) {
    throw new Error("The model returned output that did not match the expected schema.");
  }
  return response.parsed_output;
}

/**
 * Live research: Claude searches the web, then returns free-form notes plus the
 * sources it consulted. Callers usually pass the notes to `generateStructured`.
 */
export async function researchWithWebSearch(opts: {
  system?: string;
  prompt: string;
  maxUses?: number;
}): Promise<{ notes: string; sources: AiSource[] }> {
  const c = getClient();
  const messages: Anthropic.Beta.BetaMessageParam[] = [{ role: "user", content: opts.prompt }];
  const sources = new Map<string, AiSource>();
  let notes = "";

  for (let attempt = 0; attempt < 4; attempt++) {
    const stream = c.beta.messages.stream({
      model: AI_MODEL,
      max_tokens: 16000,
      betas: [FALLBACK_BETA],
      fallbacks: "default",
      system: opts.system ?? OPERATOR_SYSTEM,
      tools: [{ type: "web_search_20260209", name: "web_search", max_uses: opts.maxUses ?? 6 }],
      messages,
    });
    const message = await stream.finalMessage();
    for (const block of message.content) {
      if (block.type === "text") notes += block.text + "\n";
      if (block.type === "web_search_tool_result" && Array.isArray(block.content)) {
        for (const result of block.content) {
          if (result.type === "web_search_result") {
            sources.set(result.url, { title: result.title, url: result.url });
          }
        }
      }
    }
    if (message.stop_reason === "pause_turn") {
      messages.push({ role: "assistant", content: message.content });
      continue;
    }
    if (message.stop_reason === "refusal") {
      throw new Error("The model declined this research request.");
    }
    break;
  }
  return { notes: notes.trim(), sources: [...sources.values()] };
}

export interface AiResult<T> {
  data: T;
  usedAi: boolean;
  warning?: string;
}

/**
 * Run an AI generator with a deterministic fallback. Never throws because of
 * missing credentials; the caller learns what happened through `usedAi`.
 */
export async function withAi<T>(run: () => Promise<T>, fallback: () => T): Promise<AiResult<T>> {
  if (!aiEnabled()) {
    return {
      data: fallback(),
      usedAi: false,
      warning: "ANTHROPIC_API_KEY is not configured – generated with built-in templates (demo mode).",
    };
  }
  try {
    return { data: await run(), usedAi: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("AI generation failed, using fallback:", message);
    return { data: fallback(), usedAi: false, warning: `AI request failed (${message}); used template output.` };
  }
}
