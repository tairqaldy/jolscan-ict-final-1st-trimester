import { IllustrationFrame, type IllustrationProps } from "./frame";

/** Nothing to compare or rank yet: two blank door signs side by side. Signs only, no figures. */
export function BlankSigns(props: IllustrationProps) {
  return (
    <IllustrationFrame {...props}>
      <path d="M8 72h104" stroke="var(--border-strong)" strokeWidth={1.5} />
      {[14, 72].map((x) => (
        <g key={x}>
          <rect x={x} y={12} width={34} height={46} rx={4} fill="var(--surface)" stroke="var(--border-strong)" strokeWidth={1.5} />
          <rect x={x + 7} y={20} width={20} height={30} rx={2} stroke="currentColor" strokeWidth={1.5} strokeDasharray="3 3" />
          <circle cx={x + 17} cy={16} r={1} fill="currentColor" />
        </g>
      ))}
      <path d="M56 31h8l-3-3M64 39h-8l3 3" stroke="var(--accent)" strokeWidth={2} />
    </IllustrationFrame>
  );
}
