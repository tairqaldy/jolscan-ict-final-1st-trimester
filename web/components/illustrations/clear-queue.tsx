import { IllustrationFrame, type IllustrationProps } from "./frame";

/** Nothing to review: a clipboard with a check mark and empty lines. */
export function ClearQueue(props: IllustrationProps) {
  return (
    <IllustrationFrame {...props}>
      <rect x={34} y={12} width={52} height={62} rx={4} fill="var(--surface)" stroke="var(--border-strong)" strokeWidth={1.5} />
      <rect x={48} y={7} width={24} height={10} rx={2} fill="var(--surface-3)" stroke="currentColor" strokeWidth={1.5} />
      <path d="m48 38 8 8 16-16" stroke="var(--accent)" strokeWidth={4} />
      <path d="M44 58h32M44 66h20" stroke="var(--border-strong)" strokeWidth={2} />
    </IllustrationFrame>
  );
}
