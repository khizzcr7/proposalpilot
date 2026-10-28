import { PROFILE } from "./profile";
import type { JobDetails } from "./extract";
import type { FitScore } from "./score";

export function draftProposal(details: JobDetails, fit: FitScore): string {
  const skillsLine =
    fit.matchedSkills.length > 0
      ? `I work with ${fit.matchedSkills.join(", ")}, which covers the core of this post.`
      : "I read the post closely, and I want to check fit on the stack before I commit to a timeline.";
  const rateLine =
    details.hourlyMin !== null
      ? `My rate for this kind of work is $${Math.max(PROFILE.rateFloorUsd, details.hourlyMin)}/hr, within your posted range.`
      : details.fixedBudget !== null
        ? `For a fixed budget of $${details.fixedBudget}, I would confirm the exact deliverables first, then quote a milestone plan.`
        : `My usual rate is $${PROFILE.rateFloorUsd}/hr, and I am happy to agree a fixed milestone price once the deliverables are clear.`;
  const questions = details.questions.slice(0, 3).map((q) => `- ${q}`).join("\n");

  return [
    `Hi, I am ${PROFILE.name}, a ${PROFILE.title} working fully remotely from Karachi, Pakistan.`,
    ``,
    `On your post "${details.title}": ${details.summary} ${skillsLine}`,
    ``,
    `How I would start:`,
    `- Confirm the first deliverable and the acceptance check for it, so there is no guesswork.`,
    `- Build in small, reviewable milestones, with a short update at each one.`,
    `- Hand over clean, documented work you can maintain after delivery.`,
    ``,
    `${rateLine}`,
    ``,
    `Quick questions before I start:`,
    questions,
    ``,
    `If that sounds right, I can start with the first milestone and share a short plan. Thanks for considering my proposal.`,
    ``,
    `- ${PROFILE.name} (GitHub: ${PROFILE.github})`,
  ].join("\n");
}
