import { IllustrationFrame, type IllustrationProps } from "./frame";

/** No results or not found: a magnifier over an empty table. */
export function EmptySearch(props: IllustrationProps) {
  return (
    <IllustrationFrame {...props}>
      <rect x={10} y={10} width={76} height={58} rx={4} fill="var(--surface)" stroke="var(--border-strong)" strokeWidth={1.5} />
      <path d="M10.75 22h74.5V14a3.25 3.25 0 0 0-3.25-3.25H14A3.25 3.25 0 0 0 10.75 14z" fill="var(--surface-3)" />
      <path d="M10 22h76M10 37h76M10 52h76" stroke="var(--border-strong)" strokeWidth={1} />
      <circle cx={84} cy={46} r={15} fill="var(--surface)" stroke="currentColor" strokeWidth={3} />
      <path d="M78 46h12" stroke="var(--accent)" strokeWidth={2.5} />
      <path d="m95 57 13 13" stroke="currentColor" strokeWidth={5} />
    </IllustrationFrame>
  );
}
