import { runPipeline } from "@barnum/barnum/pipeline";
import { listDocs, extractStatements, evaluateStatement } from "./handlers/steps";

const findings = await runPipeline(
  listDocs
    .iterate()
    .flatMap(extractStatements)
    // Limit to 5 statements for demo purposes
    .take(5)
    .map(evaluateStatement)
    .collect(),
);

console.log(JSON.stringify(findings, null, 2));
