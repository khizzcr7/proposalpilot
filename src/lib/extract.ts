export interface JobDetails {
  title: string;
  budgetText: string;
  hourlyMin: number | null;
  hourlyMax: number | null;
  fixedBudget: number | null;
  skillsFound: string[];
  remote: boolean;
  redFlags: string[];
  questions: string[];
  summary: string;
}

const SKILL_PATTERNS: Array<[string, RegExp]> = [
  ["React", /\breact\b/i],
  ["Node.js", /\bnode(\.js)?\b/i],
  ["TypeScript", /\btypescript\b|\bts\b/i],
  ["JavaScript", /\bjavascript\b|\bjs\b/i],
  ["REST APIs", /\brest\b|\bapi\b/i],
  ["PostgreSQL", /\bpostgres(ql)?\b/i],
  ["Dynamics 365", /\bdynamics( 365)?\b|\bd365\b/i],
  ["Power Platform", /\bpower platform\b|\bpower apps\b|\bpower automate\b/i],
  ["Dataverse", /\bdataverse\b/i],
  ["Power Apps", /\bpower apps\b/i],
  ["Power Pages", /\bpower pages\b/i],
  ["Power Automate", /\bpower automate\b/i],
  ["Next.js", /\bnext(\.js)?\b/i],
  ["Python", /\bpython\b/i],
  ["WordPress", /\bwordpress\b/i],
  ["Shopify", /\bshopify\b/i],
  ["Flutter", /\bflutter\b/i],
  ["Go", /\bgo(lang)?\b/i],
  ["Rust", /\brust\b/i],
];

const RED_FLAG_PATTERNS: Array<[string, RegExp]> = [
  ["Asks for unpaid test work or a free trial task", /\bfree (test|trial|sample)\b|\bunpaid test\b/i],
  ["Payment is vague or deferred (exposure, future work, revenue share only)", /\bexposure\b|\brevenue share only\b|\bpay later\b|\bno budget yet\b/i],
  ["Asks for work before any contract or milestone", /\bbefore (any )?payment\b|\bwork first\b/i],
  ["Scope is very vague (no deliverable named)", /\basap\b.{0,20}\banything\b/i],
];

export function extractJobDetails(rawPost: string): JobDetails {
  const text = rawPost.trim();
  const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean);
  const title = lines[0] ? lines[0].replace(/^#+\s*/, "").slice(0, 120) : "Untitled job post";

  const rangeMatch = text.match(/\$(\d+(?:\.\d+)?)\s*(?:-|to|–)\s*\$?(\d+(?:\.\d+)?)\s*\/?\s*(hr|hour)/i);
  const singleMatch = rangeMatch
    ? null
    : text.match(/\$(\d+(?:\.\d+)?)\s*\/?\s*(hr|hour)/i);
  // Normalised: hourlyMin / hourlyMax, or nulls when no hourly rate is stated.
  const hourlyMin = rangeMatch ? Number(rangeMatch[1]) : singleMatch ? Number(singleMatch[1]) : null;
  const hourlyMax = rangeMatch ? Number(rangeMatch[2]) : hourlyMin;
  const fixed = text.match(/(?:budget|fixed price|fixed)[:\s]*\$([\d,]+)/i)
    || text.match(/\$([\d,]+)\s*(?:fixed|total budget)/i);

  const skillsFound = SKILL_PATTERNS.filter(([, re]) => re.test(text)).map(([name]) => name);
  const remote = /\bremote\b/i.test(text);
  const redFlags = RED_FLAG_PATTERNS.filter(([, re]) => re.test(text)).map(([label]) => label);
  if (!remote && /\bon[- ]site\b/i.test(text)) {
    redFlags.push("On-site role, which does not fit a fully remote freelancer");
  }

  const questions: string[] = [];
  if (hourlyMin === null && !fixed) questions.push("What is the budget for this project?");
  if (!/\bdeadline\b|\bdue\b|\btimeline\b/i.test(text)) questions.push("What is the deadline or timeline?");
  if (!/\bdeliverable/i.test(text) && lines.length < 4) questions.push("What exactly should be delivered in the first milestone?");
  questions.push("Who reviews the work, and how is feedback given?");

  const summary =
    skillsFound.length > 0
      ? `A ${remote ? "remote" : ""} lead asking for ${skillsFound.slice(0, 5).join(", ")}${skillsFound.length > 5 ? ", and more" : ""}.`
      : "A lead with no clearly named technical skills in the post.";

  return {
    title,
    budgetText: hourlyMin !== null
      ? `$${hourlyMin}${hourlyMax !== null && hourlyMax !== hourlyMin ? `-$${hourlyMax}` : ""}/hr`
      : fixed
        ? `$${fixed[1]} fixed`
        : "No budget stated",
    hourlyMin,
    hourlyMax,
    fixedBudget: fixed ? Number(fixed[1].replace(/,/g, "")) : null,
    skillsFound,
    remote,
    redFlags,
    questions,
    summary,
  };
}
