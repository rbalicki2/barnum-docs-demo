# docs-test

A barnum demo that verifies documentation against source code. It reads markdown files from `docs/`, uses Claude to extract factual claims, then uses Claude again to check each claim against the actual source in `src/`.

## How it works

The entire pipeline is defined in `run.ts`:

```typescript
const findings = await runPipeline(
  listDocs
    .iterate()
    .flatMap(extractStatements)
    .take(5)
    .map(evaluateStatement)
    .collect(),
);
```

Three handlers do the work:

1. **`listDocs`** -- reads all markdown files from `docs/` and returns their contents.
2. **`extractStatements`** -- sends each doc to Claude and asks it to extract concrete, verifiable factual claims (e.g. "the app uses useReducer for state management").
3. **`evaluateStatement`** -- sends each claim back to Claude with access to the source code and asks whether the claim is true or false.

`listDocs` returns an array. `.iterate()` enters the Iterator API, `.flatMap(extractStatements)` fans out each doc into its individual claims, `.take(5)` limits to 5 claims for demo purposes, `.map(evaluateStatement)` checks each one in parallel, and `.collect()` gathers the results into an array.

The handlers call Claude via the CLI (`claude -p ...`), spawned as a subprocess. See `handlers/call-claude.ts`.

## Why barnum

Barnum pipelines separate *what happens* from *how it's orchestrated*. Each handler is a plain async function that does one thing. The pipeline decides the order, parallelism, and data flow between them.

This matters because not every step needs an LLM. `listDocs` is just `readdirSync` -- there's no reason to send a filesystem listing through Claude. `extractStatements` and `evaluateStatement` need Claude because they require judgment. Barnum lets you mix LLM calls and ordinary code in the same pipeline without treating everything as a prompt. You use LLMs where they add value and plain code where they don't.

The pipeline also makes parallelism explicit. `.map(evaluateStatement)` evaluates all 5 claims concurrently -- barnum dispatches them in parallel automatically. If we used `.fold()` instead, they'd run sequentially. The pipeline shape declares the execution strategy; the handlers don't need to know or care.

## Making it more robust

This demo has no error handling. Claude calls can fail (timeout, rate limit, malformed JSON response). In production you'd want:

- **Timeouts** on each Claude call via [`withTimeout`](https://barnum-circus.github.io/docs/patterns/timeout). If Claude hangs for 30 seconds, kill it and move on.
- **Retry with error recovery** via [`tryCatch`](https://barnum-circus.github.io/docs/patterns/error-handling) + `loop`. If `extractStatements` returns malformed JSON, catch the parse error and retry (up to N times).
- **Graceful degradation** with `Result`. Instead of letting one bad claim crash the whole pipeline, each `evaluateStatement` could return `Result<Finding, Error>`, and the pipeline could `.collectResult()` or filter out failures.

The barnum patterns for all of these are compositional -- you wrap the relevant section of the pipeline without restructuring the rest.

## How we built it

The pipeline in `run.ts` and the handler definitions in `handlers/steps.ts` were vibe-coded -- written by prompting Claude Code with what we wanted and iterating on the output. The `docs/` folder contains sample documentation and `src/` contains the sample React app the docs describe.

## Running it

```
pnpm install
pnpm demo
```

Requires the `claude` CLI to be available on your PATH.
