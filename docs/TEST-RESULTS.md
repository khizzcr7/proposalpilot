# ProposalPilot — verification results (October 28, 2026)

## Official requirements (verified live, not from snippets)
- https://www.builder.io/hackathon — $10,000 total (Grand $5,000, 2nd
  $2,500, 3rd $1,500, 4th $750, 5th $250); worldwide, 18+, no registration;
  build, record a public Clips demo, submit by November 9, 2026 11:59 PM PT.
- https://www.builder.io/hackathon/rules — judging: Usefulness and
  Execution 40%, Creativity and Design 20%, Innovation 20%, Cleverness and
  Use of Agent-Native 20%. Submission must include project description,
  creator/team details, contact info, and a public Clips recording viewable
  without login. A public repo or live deployment is encouraged, not
  required. Deadline in UTC: November 10, 2026 07:59 UTC = 12:59 PM PKT.
- https://www.builder.io/hackathon/submit — form fields: First name,
  Last name, Email, Project name, Project description, Project/GitHub URL
  (optional), Public Clips recording URL (required), Slides URL (optional),
  rules agreement checkbox (required).

## Action tests (real defineAction definitions, Node runtime)
Run: bundled app/test-actions.ts with esbuild and executed it.
- Sample 1 (React + Node API, $35-50/hr, remote): budget parsed
  "$35-$50/hr", skills React/Node/TypeScript/JavaScript/REST APIs/PostgreSQL,
  no red flags, score 100 Strong fit, draft 1,045 chars.
- Sample 2 (Power Platform, $800 fixed, remote): budget "$800 fixed",
  skills Dynamics 365/Power Platform/Dataverse/Power Apps/Power Automate,
  score 95 Strong fit, draft 1,086 chars.
- Sample 3 (vague, unpaid test, exposure pay, on-site): 3 red flags,
  score 10 Skip, draft still generated but flagged by the score.
- Copy rule: no em-dash in any draft (asserted in the test).
- One bug found and fixed by these tests: hourly range printed as
  "$35-$hr/hr" (wrong regex group). Fixed and re-verified: "$35-$50/hr".

## Build and serve (local)
- `npm run build` (tsc + vite): passes. Output dist/index.html serves the
  app title "ProposalPilot".
- `vite preview` on port 4173: HTTP 200, correct HTML shell and asset
  references.
- NOT yet verified in a real browser: clicking through the UI (paste sample,
  run agent, edit draft, save, mark Ready/Sent) in a live browser. The
  parent agent must run that smoke test on the deployed URL before
  submission. The action logic behind those buttons is the code tested
  above, and the UI calls the same definitions through runAction().

## Known bundling note (honest)
@agent-native/core is server-first: its action graph statically imports
Node/DB modules. The browser bundle therefore uses vite-plugin-node-polyfills
plus two tiny stubs (src/stubs/postgres.ts, src/stubs/async_hooks.ts) for
modules the pure actions never execute. The stubs throw if ever called, so
they cannot silently fake a database. If the browser smoke test shows any
runtime error from the framework graph, the fallback is the scaffold's
server-side action pattern (actions on a server, UI over HTTP), which is
how the framework is designed to run.
