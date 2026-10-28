// Agent-Native actions for ProposalPilot.
// Each capability is defined exactly once with defineAction() from
// @agent-native/core. The React UI, the Agent panel and the Actions/API view
// all call the same definition: UI buttons call definition.run(), the agent
// trace calls definition.run() step by step, and the API view reads
// definition.tool (description + JSON-schema parameters).
// Storage is the browser's localStorage, so the demo needs no account, no
// server and no API key. Nothing here pretends to call an LLM.
import { defineAction } from "@agent-native/core/action";
import { z } from "zod";
import { extractJobDetails, type JobDetails } from "./lib/extract";
import { scoreFit, type FitScore } from "./lib/score";
import { draftProposal } from "./lib/draft";

export interface SavedProposal {
  id: string;
  title: string;
  status: "Draft" | "Ready" | "Sent";
  createdAt: string;
  details: JobDetails;
  fit: FitScore;
  draft: string;
}

const STORE_KEY = "proposalpilot.proposals.v1";

function loadProposals(): SavedProposal[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as SavedProposal[]) : [];
  } catch {
    return [];
  }
}

function storeProposals(items: SavedProposal[]) {
  localStorage.setItem(STORE_KEY, JSON.stringify(items));
}

export const extractJobDetailsAction = defineAction({
  description:
    "Extract structured details from a raw freelance job post: title, budget, named skills, remote status, red flags and questions to ask.",
  schema: z.object({
    rawPost: z.string().min(10).describe("The full raw text of the freelance job post"),
  }),
  http: { method: "POST" },
  run: async ({ rawPost }) => extractJobDetails(rawPost),
});

export const scoreFitAction = defineAction({
  description:
    "Score a lead 0-100 against the freelancer profile, with a transparent breakdown. Only skills in the profile count as matched; nothing else is claimed.",
  schema: z.object({
    details: z.unknown().describe("The JobDetails object returned by extractJobDetails"),
  }),
  http: { method: "POST" },
  run: async ({ details }) => scoreFit(details as JobDetails),
});

export const draftProposalAction = defineAction({
  description:
    "Draft an editable freelance proposal tied to the extracted job details and fit score, with a rate line grounded in the post's budget.",
  schema: z.object({
    details: z.unknown().describe("The JobDetails object returned by extractJobDetails"),
    fit: z.unknown().describe("The FitScore object returned by scoreFit"),
  }),
  http: { method: "POST" },
  run: async ({ details, fit }) => ({
    draft: draftProposal(details as JobDetails, fit as FitScore),
  }),
});

export const saveProposalAction = defineAction({
  description: "Save a proposal draft to the local pipeline so it can be edited, marked Ready, or marked Sent.",
  schema: z.object({
    details: z.unknown().describe("The JobDetails object returned by extractJobDetails"),
    fit: z.unknown().describe("The FitScore object returned by scoreFit"),
    draft: z.string().min(1).describe("The proposal text to save"),
  }),
  http: { method: "POST" },
  run: async ({ details, fit, draft }) => {
    const item: SavedProposal = {
      id: crypto.randomUUID(),
      title: (details as JobDetails).title,
      status: "Draft",
      createdAt: new Date().toISOString(),
      details: details as JobDetails,
      fit: fit as FitScore,
      draft,
    };
    const items = [item, ...loadProposals()];
    storeProposals(items);
    return { id: item.id, count: items.length };
  },
});

export const listProposalsAction = defineAction({
  description: "List saved proposals from the local pipeline.",
  schema: z.object({}),
  http: { method: "GET" },
  run: async () => ({ proposals: loadProposals() }),
});

export const updateProposalStatusAction = defineAction({
  description: "Change a saved proposal's pipeline status between Draft, Ready and Sent.",
  schema: z.object({
    id: z.string().describe("The saved proposal id"),
    status: z.enum(["Draft", "Ready", "Sent"]).describe("The new pipeline status"),
    draft: z.string().optional().describe("Edited proposal text to save alongside the status change"),
  }),
  http: { method: "POST" },
  run: async ({ id, status, draft }) => {
    const items = loadProposals().map((p) =>
      p.id === id ? { ...p, status, draft: draft ?? p.draft } : p,
    );
    storeProposals(items);
    const found = items.find((p) => p.id === id);
    if (!found) throw new Error(`No saved proposal with id ${id}`);
    return { id, status: found.status };
  },
});

export const deleteProposalAction = defineAction({
  description: "Delete a saved proposal from the local pipeline.",
  schema: z.object({
    id: z.string().describe("The saved proposal id"),
  }),
  http: { method: "POST" },
  run: async ({ id }) => {
    storeProposals(loadProposals().filter((p) => p.id !== id));
    return { id, deleted: true };
  },
});

export const ACTIONS = [
  { name: "extractJobDetails", definition: extractJobDetailsAction },
  { name: "scoreFit", definition: scoreFitAction },
  { name: "draftProposal", definition: draftProposalAction },
  { name: "saveProposal", definition: saveProposalAction },
  { name: "listProposals", definition: listProposalsAction },
  { name: "updateProposalStatus", definition: updateProposalStatusAction },
  { name: "deleteProposal", definition: deleteProposalAction },
] as const;

// One runner for every surface. The UI and the Agent panel both go through
// here, so a trace entry is an honest record of a real action call.
export async function runAction<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  definition: { run: (args: any, ctx: any) => Promise<T> | T },
  args: Record<string, unknown>,
  trace?: (entry: string) => void,
  label?: string,
): Promise<T> {
  const result = await definition.run(args, { caller: "frontend" });
  trace?.(`${label ?? "action"} -> ${JSON.stringify(result).slice(0, 400)}`);
  return result;
}
