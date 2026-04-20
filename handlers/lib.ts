import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const baseDir = path.resolve(__dirname, "..");
export const docsDir = path.join(baseDir, "docs");
export const srcDir = path.join(baseDir, "src");

/** Strip markdown code fences if present, then trim. */
export function stripCodeFences(text: string): string {
  const fenced = text.match(/^```(?:json)?\n([\s\S]*?)\n```$/m);
  if (fenced) {
    return fenced[1];
  }
  return text.trim();
}
