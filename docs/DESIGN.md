# ProposalPilot — Design

## Problem
Freelancers lose the first hour on every lead: reading a job post, checking
whether it actually fits, working out a fair rate, and writing a proposal that
answers the post instead of sounding generic. Generic proposals get ignored;
careful ones take too long to write for every lead.

## Idea
ProposalPilot is an agent-native copilot for freelance proposals. Paste a job
post once, and the same shared actions do the whole first pass:

1. `extractJobDetails` — pulls title, budget, skills, remote status, red
   flags and open questions out of the raw post.
2. `scoreFit` — scores the lead 0-100 against the freelancer's real profile,
   with a transparent breakdown. It never claims a skill the profile does not
   have.
3. `draftProposal` — writes a structured, editable proposal draft tied to the
   extracted requirements, with a rate suggestion grounded in the post's budget.
4. `saveProposal` — stores the draft in a local pipeline (Draft, Ready, Sent).

## Why this is agent-native, not just a form
Every capability is defined exactly once with `defineAction()` from
`@agent-native/core`, with a Zod schema, a description and a `run`
implementation. The same definition is then called from:

- the React UI (buttons and the editor),
- the Agent panel, which runs the actions in sequence and shows a visible
  trace of each action call, its inputs and its outputs,
- the Actions/API view, which lists every action definition and its schema.

Change an action once and the UI, the agent and the API view all change
together. That is the shared-action layer the hackathon asks for.

## Honesty note (also shown in the app footer)
The demo agent runs deterministically on-device with no API key, so anyone can
try the live demo without signing up or paying. The actions are real
`defineAction` definitions: replacing a `run` body with an LLM tool call keeps
the UI, agent and API surfaces identical. Nothing in the demo pretends to call
an LLM, and no skill is claimed that is not in the profile.

## Profile used (only verified facts)
- Muhammad Khizar, Software Engineer II, Dynamics 365 / Power Platform,
  remote from Karachi, Pakistan.
- Stack: React, Node.js, TypeScript, JavaScript, REST APIs, PostgreSQL,
  Dynamics 365, Dataverse, Power Apps, Power Pages, Power Automate, plugins,
  FetchXML.
- GitHub: khizzcr7.

## Judging map (official rubric)
- Usefulness and Execution 40%: a complete flow from pasted post to an
  editable, sendable proposal draft, with a saved pipeline.
- Creativity and Design 20%: the agent trace panel — the agent's work is
  visible, inspectable and re-runnable step by step.
- Innovation 20%: people and agent share one action layer; the user edits,
  approves and sends, the agent does the first pass.
- Cleverness and Use of Agent-Native 20%: one `defineAction` per capability,
  called from UI, agent trace and API view.

## What is NOT claimed
- No live LLM call, no email sending, no Upwork integration, no account.
  Proposals are drafted locally and marked Sent by the user when they send
  them wherever the lead lives. The app stores data only in the browser
  (localStorage), so there is nothing to leak.
