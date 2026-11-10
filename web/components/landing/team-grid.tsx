import { TEAM } from "@/lib/team";

/** Six team members. Names and roles come from lib/team.ts. */
export function TeamGrid() {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {TEAM.map((m) => (
        <li key={m.name} className="rounded-lg border border-border bg-surface p-4">
          <span
            aria-hidden
            className="grid size-12 place-items-center rounded-md bg-inverse font-display text-xl font-bold text-inverse-fg"
          >
            {m.name.slice(0, 1)}
          </span>
          <p className="mt-3 font-display text-lg font-semibold">{m.name}</p>
          <p className="text-sm font-medium">{m.role}</p>
          <p className="mt-1 text-xs text-muted">{m.focus}</p>
        </li>
      ))}
    </ul>
  );
}
