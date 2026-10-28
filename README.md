# ProposalPilot

Agent-native copilot for freelance proposals, built for the Builder.io
Agent-Native Hackathon (October 27 – November 9, 2026).

## What it does
Paste a freelance job post. One shared set of Agent-Native actions does the
first pass:

1. `extractJobDetails` — title, budget, named skills, remote status, red
   flags, questions to ask.
2. `scoreFit` — a 0-100 fit score against the freelancer profile, with a
   transparent breakdown. Only skills in the profile count as matched.
3. `draftProposal` — an editable proposal draft tied to the extracted
   requirements, with a rate line grounded in the post's budget.
4. `saveProposal` / `listProposals` / `updateProposalStatus` /
   `deleteProposal` — a local pipeline (Draft, Ready, Sent).

Every capability is defined exactly once with `defineAction()` from
`@agent-native/core` (see `src/actions.ts`). The React UI, the Agent panel
trace and the Actions/API view all call the same definitions.

## Run locally
```bash
npm install
npm run dev
```
Then open the printed local URL. No account, no API key, no server: data
stays in the browser (localStorage).

## Honesty note
The demo agent runs deterministically on-device with no LLM key, so anyone
can try the live demo without signing up. The actions are real
`defineAction` definitions: swapping a `run` body for an LLM tool call keeps
the UI, agent and API surfaces identical. Nothing here pretends to call an
LLM, and no skill is claimed that is not in the profile.

## Profile
Muhammad Khizar, Software Engineer II (Dynamics 365 / Power Platform),
remote from Karachi, Pakistan. Stack: React, Node.js, TypeScript, JavaScript,
REST APIs, PostgreSQL, Dynamics 365, Dataverse, Power Apps, Power Pages,
Power Automate, plugins, FetchXML. GitHub: khizzcr7.

## Pre-existing work disclosure (for the submission form)
Built during the hackathon from October 28, 2026. Uses the open-source
Agent-Native framework (`@agent-native/core`) and its chat-template scaffold
as a reference; the ProposalPilot code, actions, UI and copy are original
work written for this entry. No templates, client work or third-party assets
beyond the framework and React/Vite/Zod libraries.
