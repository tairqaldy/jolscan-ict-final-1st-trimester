import { TEAM } from "@/lib/team";

/** Six team members. Names and roles come from lib/team.ts. */
export function TeamGrid() {
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {TEAM.map((m) => (
        <li
          key={m.name}
          className="group relative flex flex-col justify-between rounded-xl border border-border bg-surface p-4.5 transition-all duration-200 motion-safe:hover:-translate-y-1 hover:border-border-strong hover:bg-surface-2 hover:shadow-lg"
        >
          <div>
            <span
              aria-hidden
              className="grid size-11 place-items-center rounded-lg bg-inverse font-display text-lg font-bold text-inverse-fg shadow-sm transition-transform duration-200 motion-safe:group-hover:scale-105"
            >
              {m.name.slice(0, 1)}
            </span>
            <p className="mt-3.5 font-display text-base font-semibold tracking-tight text-fg">{m.name}</p>
            <p className="text-xs font-medium text-accent-ink">{m.role}</p>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted">{m.focus}</p>
        </li>
      ))}
    </ul>
  );
}
