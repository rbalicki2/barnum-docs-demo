import { runPipeline } from "@barnum/barnum/pipeline";
import { listDocs, extractStatements, evaluateStatement } from "./handlers/steps";

const findings = await runPipeline(
  listDocs
    .iterate()
    .flatMap(extractStatements)
    .map(evaluateStatement)
    .collect(),
);

console.log(JSON.stringify(findings, null, 2));
