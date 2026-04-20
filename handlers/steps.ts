import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { createHandler, optionSchema, some, none } from "@barnum/barnum/runtime";
import type { Option } from "@barnum/barnum/pipeline";
import { z } from "zod";
import { docsDir, srcDir, stripCodeFences } from "./lib";
import { callClaude } from "./call-claude";

// ── Step 1: list markdown files in docs/ ────────────────────────────

export const listDocs = createHandler(
  {
    outputValidator: z.array(
      z.object({
        filePath: z.string(),
        fileName: z.string(),
        fileNumber: z.number(),
        content: z.string(),
      }),
    ),
    handle: async () => {
      const files = readdirSync(docsDir)
        .filter((f) => f.endsWith(".md"))
        .sort();
      console.error(`[listDocs] Found ${files.length} markdown files in docs/`);
      return files.map((fileName, index) => ({
        filePath: path.join(docsDir, fileName),
        fileName,
        fileNumber: index + 1,
        content: readFileSync(path.join(docsDir, fileName), "utf-8"),
      }));
    },
  },
  "listDocs",
);

// ── Step 2: extract factual statements from one doc ─────────────────

const StatementValidator = z.object({
  filePath: z.string(),
  fileName: z.string(),
  fileNumber: z.number(),
  lineNumber: z.number(),
  claim: z.string(),
});

export const extractStatements = createHandler(
  {
    inputValidator: z.object({
      filePath: z.string(),
      fileName: z.string(),
      fileNumber: z.number(),
      content: z.string(),
    }),
    outputValidator: z.array(StatementValidator),
    handle: async ({ value }) => {
      console.error(
        `[extractStatements] Analyzing ${value.fileName} for factual claims...`,
      );

      const response = await callClaude({
        prompt: [
          "Analyze the following documentation file and identify every factual claim",
          "it makes about source code files, components, props, types, hooks, CSS classes,",
          "function behavior, or implementation details.",
          "",
          "IMPORTANT: Only extract concrete, verifiable claims — things that can be",
          "checked by reading the source code. Skip vague or subjective statements.",
          "",
          `File: ${value.fileName}`,
          "Content:",
          "```",
          value.content,
          "```",
          "",
          "Return ONLY a JSON array. Each element must have exactly two keys:",
          '  - "lineNumber": the 1-based line number in the document where the claim appears',
          '  - "claim": the specific factual assertion (one sentence)',
          "",
          "Example:",
          '[{"lineNumber": 5, "claim": "The app uses useReducer for state management"}]',
          "",
          "Return ONLY the raw JSON array. No markdown fences, no explanation.",
        ].join("\n"),
      });

      const parsed: { lineNumber: number; claim: string }[] = JSON.parse(
        stripCodeFences(response),
      );

      console.error(
        `[extractStatements] Found ${parsed.length} claims in ${value.fileName}`,
      );

      return parsed.map((s) => ({
        filePath: value.filePath,
        fileName: value.fileName,
        fileNumber: value.fileNumber,
        lineNumber: s.lineNumber,
        claim: s.claim,
      }));
    },
  },
  "extractStatements",
);

// ── Step 3: evaluate one statement against source code ──────────────

const FindingValidator = z.object({
  location: z.string(),
  fileNumber: z.number(),
  lineNumber: z.number(),
  reason: z.string(),
  claim: z.string(),
});

type Finding = z.infer<typeof FindingValidator>;

export const evaluateStatement = createHandler(
  {
    inputValidator: StatementValidator,
    outputValidator: optionSchema(FindingValidator),
    handle: async ({ value }): Promise<Option<Finding>> => {
      console.error(
        `[evaluateStatement] Checking: "${value.claim}" (${value.fileName}:${value.lineNumber})`,
      );

      const response = await callClaude({
        prompt: [
          "You are verifying whether a claim from a documentation file is factually",
          "correct by examining the actual source code.",
          "",
          `Claim: "${value.claim}"`,
          `From documentation file: ${value.fileName}, line ${value.lineNumber}`,
          "",
          `The source code lives under: ${srcDir}`,
          "",
          "Read whatever source files you need to verify this claim.",
          "Then return a JSON object with exactly one of these shapes:",
          "",
          '  If the claim is CORRECT:   { "valid": true }',
          '  If the claim is INCORRECT: { "valid": false, "reason": "why it is wrong and what is actually true" }',
          "",
          "Return ONLY the raw JSON object. No markdown fences, no extra text.",
        ].join("\n"),
        allowedTools: [`Read(//${srcDir}/**)`],
      });

      const result: { valid: boolean; reason?: string } = JSON.parse(
        stripCodeFences(response),
      );

      if (result.valid) {
        console.error(`[evaluateStatement]   ✓ valid`);
        return none();
      }

      console.error(`[evaluateStatement]   ✗ invalid — ${result.reason}`);
      return some({
        location: `${value.fileName}:${value.lineNumber}`,
        fileNumber: value.fileNumber,
        lineNumber: value.lineNumber,
        reason: result.reason ?? "unknown",
        claim: value.claim,
      });
    },
  },
  "evaluateStatement",
);
