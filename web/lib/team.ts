/**
 * Team data, edit freely. Used by the landing page and /about.
 * Roles follow the lanes proposed in docs/PLAN.md section 3; change them here
 * if the team swaps lanes at kickoff.
 */
export type TeamMember = { name: string; role: string; focus: string };

export const TEAM: TeamMember[] = [
  { name: "Tair", role: "Web app and coordination", focus: "Architecture, flows, integration, deployment" },
  { name: "Dameli", role: "Design system and visuals", focus: "Tokens, landing, charts, motion" },
  { name: "Nazar", role: "Restroom model", focus: "CLIP, zero-shot against fine-tuning, signage rules" },
  { name: "Amina", role: "Pothole model and data", focus: "YOLO training, dataset card, repair rules" },
  { name: "Alizhan", role: "Serving and performance", focus: "FastAPI, Docker, latency, cloud" },
  { name: "Roma", role: "Research, deck and QA", focus: "Slides, demo video, testing, AI evaluation" },
];

export const COURSE = { code: "ICT1103", school: "QAIRU" } as const;
