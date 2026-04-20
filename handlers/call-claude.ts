// callClaude — spawn Claude CLI in non-interactive mode.
//
// Set PREFIX_COMMAND to null to call `claude` directly,
// or to a wrapper name (e.g. "ai-sandbox") to run `<wrapper> claude -p ...`.

import { spawn } from "node:child_process";
import { baseDir } from "./lib";

const PREFIX_COMMAND: string | null = null;

const CLAUDE_TIMEOUT_MS = 5 * 60_000; // 5 minutes

export async function callClaude(args: {
  prompt: string;
  allowedTools?: string[];
  cwd?: string;
}): Promise<string> {
  const command = PREFIX_COMMAND ?? "claude";
  const cliArgs = [
    ...(PREFIX_COMMAND != null ? ["claude"] : []),
    "-p",
    args.prompt,
    "--output-format",
    "text",
    "--dangerously-skip-permissions",
  ];
  if (args.allowedTools && args.allowedTools.length > 0) {
    cliArgs.push("--allowedTools", ...args.allowedTools);
  }

  function shellQuote(arg: string): string {
    if (/[^a-zA-Z0-9_\-=/:.,@]/.test(arg)) {
      return `'${arg.replace(/'/g, "'\\''")}'`;
    }
    return arg;
  }
  console.error(
    `[callClaude] $ ${command} ${cliArgs.map(shellQuote).join(" ")}`,
  );

  return new Promise<string>((resolve, reject) => {
    let settled = false;

    const child = spawn(command, cliArgs, {
      cwd: args.cwd ?? baseDir,
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...process.env,
        CLAUDECODE: undefined,
        CLAUDE_CODE_ENTRYPOINT: undefined,
      },
    });

    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        console.error(
          `[callClaude] timed out after ${CLAUDE_TIMEOUT_MS / 1000}s, killing`,
        );
        child.kill("SIGTERM");
        reject(
          new Error(`Claude CLI timed out after ${CLAUDE_TIMEOUT_MS / 1000}s`),
        );
      }
    }, CLAUDE_TIMEOUT_MS);

    const stdoutChunks: Buffer[] = [];

    child.stdout.on("data", (chunk: Buffer) => {
      stdoutChunks.push(chunk);
      process.stderr.write(chunk);
    });

    child.stderr.on("data", (chunk: Buffer) => {
      process.stderr.write(chunk);
    });

    child.on("error", (error) => {
      if (!settled) {
        settled = true;
        clearTimeout(timeout);
        reject(new Error(`Claude CLI failed: ${error.message}`));
      }
    });

    child.on("close", (code, signal) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);

      const stdout = Buffer.concat(stdoutChunks).toString("utf-8");
      if (signal) {
        console.error(`[callClaude] killed by signal ${signal}`);
        reject(new Error(`Claude CLI killed by ${signal}`));
        return;
      }
      if (code !== 0) {
        console.error(`[callClaude] exited with code ${code}`);
        reject(new Error(`Claude CLI exited with code ${code}`));
        return;
      }
      console.error(
        `[callClaude] completed successfully (${stdout.length} chars)`,
      );
      resolve(stdout);
    });
  });
}
