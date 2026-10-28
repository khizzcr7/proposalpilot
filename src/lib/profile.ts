// The freelancer profile. Only verified facts about Muhammad Khizar are listed
// here. The scorer and the draft generator may only claim skills from this list.
export const PROFILE = {
  name: "Muhammad Khizar",
  title: "Software Engineer II, Dynamics 365 / Power Platform",
  location: "Karachi, Pakistan (fully remote)",
  github: "khizzcr7",
  skills: [
    "React",
    "Node.js",
    "TypeScript",
    "JavaScript",
    "REST APIs",
    "PostgreSQL",
    "Dynamics 365",
    "Power Platform",
    "Dataverse",
    "Power Apps",
    "Power Pages",
    "Power Automate",
    "FetchXML",
  ] as string[],
  // Hourly floor in USD, from the standing preference ($25/hr).
  rateFloorUsd: 25,
};

export type Profile = typeof PROFILE;
