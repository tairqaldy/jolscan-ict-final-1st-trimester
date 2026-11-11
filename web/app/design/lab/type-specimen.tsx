import { BRAND } from "@/lib/brand";
import { Table, TD, TH, THead, TR } from "@/components/ui/table";

/** The nine Kazakh letters that are not in the Russian alphabet. */
export const KAZAKH_LETTERS = "ә ғ қ ң ө ұ ү һ і";

/** 14, 16, 28 and 64 px: the scale steps the app uses most (tokens.css). */
const SIZES = [
  { cls: "text-sm", px: 14 },
  { cls: "text-base", px: 16 },
  { cls: "text-2xl", px: 28 },
  { cls: "text-5xl", px: 64 },
];

/**
 * The type trial (G-43): the same Qarau text in every column. A column swaps
 * the fonts by pointing --font-body or --font-code at a lab font, so this
 * markup never changes between variants.
 */
export function TypeSpecimen() {
  return (
    <div className="grid gap-6">
      <p className="font-display text-5xl font-bold" data-lab-sample="hero">
        Inspect roads and signs
      </p>

      <ul className="grid gap-2 border-y border-border py-4">
        {SIZES.map((s) => (
          <li key={s.px} className="grid grid-cols-[3rem_1fr] items-baseline gap-2">
            <span className="font-mono text-xs text-subtle">{s.px} px</span>
            <span className={`${s.cls} font-display font-bold`}>
              {BRAND.name} ({BRAND.nativeName})
            </span>
          </li>
        ))}
      </ul>

      <div className="grid gap-1">
        <p className="text-xs font-semibold tracking-wide text-muted uppercase">Kazakh letters</p>
        <p className="text-2xl" data-lab-sample="kazakh">
          {KAZAKH_LETTERS}
        </p>
        <p className="text-2xl">{KAZAKH_LETTERS.toUpperCase()}</p>
        <p className="font-mono text-base" data-lab-sample="kazakh-mono">
          {KAZAKH_LETTERS}
        </p>
      </div>

      <div className="grid gap-2">
        <p className="text-base" lang="kk">
          Qarau жолдар мен белгілерді фотосурет арқылы тексереді.
        </p>
        <p className="text-base" lang="ru">
          Qarau проверяет дороги и таблички по фотографии и объясняет каждое правило.
        </p>
        <p className="text-sm text-muted">{BRAND.tagline}</p>
      </div>

      <div className="grid gap-1">
        <p className="text-xs font-semibold tracking-wide text-muted uppercase">KPI</p>
        <p className="tabular font-display text-5xl font-bold">1 234</p>
        <p className="text-sm text-muted">Photos checked</p>
      </div>

      <Table caption="Rule points and score">
        <THead>
          <tr>
            <TH>Rule</TH>
            <TH className="text-right">Points</TH>
          </tr>
        </THead>
        <tbody>
          <TR>
            <TD>R2 Size points</TD>
            <TD className="text-right font-mono">+7</TD>
          </TR>
          <TR>
            <TD>R5 Road class</TD>
            <TD className="text-right font-mono">+6</TD>
          </TR>
          <TR>
            <TD className="font-semibold">Score</TD>
            <TD className="text-right font-mono font-semibold">13</TD>
          </TR>
        </tbody>
      </Table>
    </div>
  );
}
