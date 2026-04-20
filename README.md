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

## How we built it

The pipeline in `run.ts` and the handler definitions in `handlers/steps.ts` were vibe-coded -- written by prompting Claude Code with what we wanted and iterating on the output. The `docs/` folder contains sample documentation and `src/` contains the sample React app the docs describe.

## Running it

```
pnpm install
pnpm demo
```

Requires the `claude` CLI to be available on your PATH.
