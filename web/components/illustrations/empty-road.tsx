import { IllustrationFrame, type IllustrationProps } from "./frame";

/** No photo yet: an empty road with a dashed lane line, an upload arrow and viewfinder corners. */
export function EmptyRoad(props: IllustrationProps) {
  return (
    <IllustrationFrame {...props}>
      <path d="M48 34h24l30 38H18z" fill="var(--surface-3)" stroke="var(--border-strong)" strokeWidth={1.5} />
      <g fill="var(--accent)">
        <rect x={59.25} y={37} width={1.5} height={4} rx={0.5} />
        <rect x={58.75} y={45} width={2.5} height={6} rx={0.75} />
        <rect x={58} y={56} width={4} height={10} rx={1} />
      </g>
      <path d="M60 26V8m-7 7 7-7 7 7" stroke="currentColor" strokeWidth={2.5} />
      <path d="M8 16V8h8M104 8h8v8M112 64v8h-8M16 72H8v-8" stroke="currentColor" strokeWidth={2} />
    </IllustrationFrame>
  );
}
