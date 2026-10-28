import { useCallback, useEffect, useState } from "react";
import {
  ACTIONS,
  deleteProposalAction,
  draftProposalAction,
  extractJobDetailsAction,
  listProposalsAction,
  runAction,
  saveProposalAction,
  scoreFitAction,
  updateProposalStatusAction,
  type SavedProposal,
} from "./actions";
import type { JobDetails } from "./lib/extract";
import type { FitScore } from "./lib/score";
import { SAMPLES } from "./lib/samples";
import "./styles.css";

type Step = "idle" | "running" | "done" | "error";

export default function App() {
  const [rawPost, setRawPost] = useState(SAMPLES[0].post);
  const [details, setDetails] = useState<JobDetails | null>(null);
  const [fit, setFit] = useState<FitScore | null>(null);
  const [draft, setDraft] = useState("");
  const [trace, setTrace] = useState<string[]>([]);
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<SavedProposal[]>([]);
  const [savedMsg, setSavedMsg] = useState("");
  const [copied, setCopied] = useState(false);

  const refreshSaved = useCallback(async () => {
    const res = await runAction(listProposalsAction, {});
    setSaved(res.proposals);
  }, []);

  useEffect(() => {
    refreshSaved().catch(() => undefined);
  }, [refreshSaved]);

  const addTrace = (line: string) => setTrace((t) => [...t, line]);

  async function runAgent() {
    setError("");
    setSavedMsg("");
    setStep("running");
    setTrace([`Agent run started. Calling each action once, in order, on the same data.`]);
    try {
      const d = await runAction(extractJobDetailsAction, { rawPost }, addTrace, "extractJobDetails");
      setDetails(d);
      const f = await runAction(scoreFitAction, { details: d }, addTrace, "scoreFit");
      setFit(f);
      const draftRes = await runAction(draftProposalAction, { details: d, fit: f }, addTrace, "draftProposal");
      setDraft(draftRes.draft);
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Agent run failed.");
      setStep("error");
    }
  }

  async function save() {
    if (!details || !fit) return;
    const res = await runAction(saveProposalAction, { details, fit, draft });
    setSavedMsg(`Saved to your pipeline (now ${res.count} saved). Edit it any time below.`);
    await refreshSaved();
  }

  async function changeStatus(p: SavedProposal, status: SavedProposal["status"]) {
    await runAction(updateProposalStatusAction, { id: p.id, status });
    await refreshSaved();
  }

  async function remove(p: SavedProposal) {
    await runAction(deleteProposalAction, { id: p.id });
    await refreshSaved();
  }

  function verdictClass(v: FitScore["verdict"]) {
    return v === "Strong fit" || v === "Good fit" ? "pill" : v === "Weak fit" ? "pill warn" : "pill bad";
  }

  return (
    <>
      <header>
        <h1>ProposalPilot</h1>
        <p>
          An agent-native copilot for freelance proposals. Paste a job post, and
          one shared set of Agent-Native actions extracts the details, scores
          the fit against a real freelancer profile, and drafts a proposal you
          can edit and send. Built with <code>defineAction()</code> from
          @agent-native/core.
        </p>
      </header>
      <main>
        <section className="card">
          <h2>1. Paste a job post</h2>
          <p className="muted">Try a sample, or paste a real post. Nothing leaves your browser.</p>
          <div>
            {SAMPLES.map((s) => (
              <button key={s.label} className="secondary sample-btn" onClick={() => setRawPost(s.post)}>
                {s.label}
              </button>
            ))}
          </div>
          <textarea value={rawPost} onChange={(e) => setRawPost(e.target.value)} aria-label="Job post text" />
          <div>
            <button onClick={runAgent} disabled={step === "running" || rawPost.trim().length < 10}>
              {step === "running" ? "Agent is working..." : "Run the agent: extract, score, draft"}
            </button>
            <button
              className="secondary"
              onClick={() => {
                setDetails(null);
                setFit(null);
                setDraft("");
                setTrace([]);
                setStep("idle");
              }}
            >
              Clear results
            </button>
          </div>
          {error && <p style={{ color: "#b91c1c" }}>{error}</p>}
        </section>

        {trace.length > 0 && (
          <section className="card">
            <h2>Agent trace: what the agent actually called</h2>
            <p className="muted">
              Every line is a real call to the same action definition the UI
              buttons use. No step is faked: change an action and this trace,
              the results and the API view all change together.
            </p>
            <div className="trace">{trace.join("\n")}</div>
          </section>
        )}

        {details && fit && (
          <section className="grid">
            <div className="card">
              <h2>2. What the agent found</h2>
              <p><strong>{details.title}</strong></p>
              <p>{details.summary}</p>
              <p>Budget: <strong>{details.budgetText}</strong> · Remote: <strong>{details.remote ? "Yes" : "Not stated"}</strong></p>
              <p>Skills named: {details.skillsFound.length ? details.skillsFound.join(", ") : "none"}</p>
              {details.redFlags.length > 0 && (
                <>
                  <p><strong>Red flags</strong></p>
                  <ul>{details.redFlags.map((f) => <li key={f}>{f}</li>)}</ul>
                </>
              )}
              <p><strong>Questions to ask</strong></p>
              <ul>{details.questions.map((q) => <li key={q}>{q}</li>)}</ul>
            </div>
            <div className="card">
              <h2>3. Fit score</h2>
              <p>
                <span className={verdictClass(fit.verdict)}>{fit.verdict}</span>
                <strong style={{ fontSize: 28 }}>{fit.score}/100</strong>
              </p>
              <table>
                <tbody>
                  {fit.breakdown.map((b) => (
                    <tr key={b.label}>
                      <td><strong>{b.label}</strong><br /><span className="muted">{b.note}</span></td>
                      <td>{b.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p>Matched: {fit.matchedSkills.join(", ") || "none"}</p>
              {fit.missingSkills.length > 0 && (
                <p className="muted">Not in the profile, so never claimed in the draft: {fit.missingSkills.join(", ")}</p>
              )}
            </div>
          </section>
        )}

        {draft && (
          <section className="card">
            <h2>4. Edit the draft, then save it</h2>
            <textarea value={draft} onChange={(e) => setDraft(e.target.value)} aria-label="Proposal draft" style={{ minHeight: 260 }} />
            <div>
              <button onClick={save}>Save to pipeline</button>
              <button
                className="secondary"
                onClick={async () => {
                  await navigator.clipboard.writeText(draft);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? "Copied" : "Copy draft"}
              </button>
            </div>
            {savedMsg && <p>{savedMsg}</p>}
          </section>
        )}

        <section className="card">
          <h2>Your pipeline</h2>
          {saved.length === 0 ? (
            <p className="muted">Nothing saved yet. Run the agent on a post and save a draft to see it here.</p>
          ) : (
            saved.map((p) => (
              <div key={p.id} style={{ borderTop: "1px solid #eef1f5", padding: "12px 0" }}>
                <p>
                  <strong>{p.title}</strong> · <span className="pill">{p.status}</span> · fit {p.fit.score}/100 ·{" "}
                  {new Date(p.createdAt).toLocaleString()}
                </p>
                <details>
                  <summary>View draft</summary>
                  <pre style={{ whiteSpace: "pre-wrap", font: "inherit" }}>{p.draft}</pre>
                </details>
                <button className="secondary" onClick={() => changeStatus(p, "Ready")}>Mark Ready</button>
                <button className="secondary" onClick={() => changeStatus(p, "Sent")}>Mark Sent</button>
                <button className="secondary" onClick={() => remove(p)}>Delete</button>
              </div>
            ))
          )}
        </section>

        <section className="card">
          <h2>Actions and API view: one definition, every surface</h2>
          <p className="muted">
            These are the live action definitions in this app. The UI, the
            agent trace above and this list all read the same definitions.
          </p>
          {ACTIONS.map((a) => {
            let params: unknown = null;
            try {
              params = (a.definition as unknown as { tool: { parameters?: unknown } }).tool?.parameters ?? null;
            } catch {
              params = null;
            }
            return (
              <div key={a.name} style={{ borderTop: "1px solid #eef1f5", padding: "10px 0" }}>
                <p><code>{a.name}</code> — {String((a.definition as unknown as { tool: { description?: unknown } }).tool?.description ?? "")}</p>
                {params ? <pre className="trace">{JSON.stringify(params, null, 2).slice(0, 1200)}</pre> : null}
              </div>
            );
          })}
        </section>
      </main>
      <footer>
        <p>
          Honesty note: this demo agent runs deterministically on-device with no
          API key, so anyone can try it without signing up. The actions are
          real <code>defineAction</code> definitions, so swapping a run body for
          an LLM tool call keeps the UI, agent and API surfaces identical.
          Proposals are drafted locally; sending them to a client is your step.
          Data stays in this browser (localStorage). Built for the Builder.io
          Agent-Native Hackathon, October 2026, by Muhammad Khizar, Software
          Engineer II (Dynamics 365 / Power Platform), remote from Karachi,
          Pakistan. GitHub: khizzcr7.
        </p>
      </footer>
    </>
  );
}
