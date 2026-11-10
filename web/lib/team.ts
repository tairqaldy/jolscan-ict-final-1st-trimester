/**
 * Team data, edit freely. Roles are placeholders until the team agrees them.
 * Used by the landing page and /about.
 */
export type TeamMember = { name: string; role: string; lane?: string };

export const TEAM: TeamMember[] = [
  { name: "Tair", role: "Role to be confirmed" },
  { name: "Dameli", role: "Role to be confirmed" },
  { name: "Nazar", role: "Role to be confirmed" },
  { name: "Alizhan", role: "Role to be confirmed" },
  { name: "Amina", role: "Role to be confirmed" },
  { name: "Roma", role: "Role to be confirmed" },
];

export const COURSE = { code: "ICT1103", school: "QAIRU" } as const;
