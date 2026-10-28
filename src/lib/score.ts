import { PROFILE } from "./profile";
import type { JobDetails } from "./extract";

export interface FitScore {
  score: number;
  verdict: "Strong fit" | "Good fit" | "Weak fit" | "Skip";
  matchedSkills: string[];
  missingSkills: string[];
  breakdown: Array<{ label: string; points: number; note: string }>;
}

export function scoreFit(details: JobDetails): FitScore {
  const matchedSkills = details.skillsFound.filter((s) =>
    PROFILE.skills.some((p) => p.toLowerCase() === s.toLowerCase()),
  );
  const missingSkills = details.skillsFound.filter((s) => !matchedSkills.includes(s));
  const breakdown: FitScore["breakdown"] = [];

  const skillPoints = details.skillsFound.length === 0
    ? 10
    : Math.round((matchedSkills.length / details.skillsFound.length) * 50);
  breakdown.push({
    label: "Skill match",
    points: skillPoints,
    note: `${matchedSkills.length} of ${details.skillsFound.length} named skills are in the profile.`,
  });

  const remotePoints = details.remote ? 20 : 0;
  breakdown.push({
    label: "Remote fit",
    points: remotePoints,
    note: details.remote ? "Post says remote." : "Post does not say remote.",
  });

  const budgetPoints =
    details.hourlyMin !== null && details.hourlyMin >= PROFILE.rateFloorUsd
      ? 20
      : details.fixedBudget !== null
        ? 15
        : details.hourlyMin !== null
          ? 5
          : 0;
  breakdown.push({
    label: "Budget fit",
    points: budgetPoints,
    note:
      details.hourlyMin !== null
        ? `Posted from $${details.hourlyMin}/hr against a $${PROFILE.rateFloorUsd}/hr floor.`
        : details.fixedBudget !== null
          ? `Fixed budget of $${details.fixedBudget}; confirm scope before quoting.`
          : "No budget stated, so rate must be asked up front.",
  });

  const flagPoints = Math.max(0, 10 - details.redFlags.length * 5);
  breakdown.push({
    label: "Risk check",
    points: flagPoints,
    note: details.redFlags.length === 0 ? "No red flags detected." : `${details.redFlags.length} red flag(s) detected.`,
  });

  const score = Math.max(0, Math.min(100, breakdown.reduce((sum, b) => sum + b.points, 0)));
  const verdict =
    score >= 75 ? "Strong fit" : score >= 55 ? "Good fit" : score >= 35 ? "Weak fit" : "Skip";
  return { score, verdict, matchedSkills, missingSkills, breakdown };
}
