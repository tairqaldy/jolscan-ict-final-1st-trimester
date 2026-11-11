/**
 * Design lab (G-41): token variants shown side by side on /design/lab.
 *
 * A variant is a set of CSS custom property overrides, set inline on the
 * wrapper of one column, so the live tokens in app/tokens.css never change.
 * Column A sets nothing and shows the live look; every other column differs
 * from it only in its overrides. To compare something new, add a set to
 * LAB_SETS; the page needs no other change.
 */

export type LabTheme = "light" | "dark";
export const LAB_THEMES: LabTheme[] = ["light", "dark"];

/** CSS custom properties, e.g. { "--radius-md": "4px" }. */
export type TokenMap = Record<string, string>;

export type LabVariant = {
  id: string;
  name: string;
  note: string;
  /** Overrides for both themes. */
  tokens?: TokenMap;
  /** Overrides for one theme, applied after `tokens`. */
  byTheme?: Partial<Record<LabTheme, TokenMap>>;
};

export type LabSet = {
  id: string;
  title: string;
  /** Task and issue, e.g. "G-41 (#275)". */
  task: string;
  question: string;
  /** What each column renders: real UI components. */
  specimen: "ui";
  variants: LabVariant[];
  /** Which variant stays, and why. */
  outcome: string;
};

export const LAB_SETS: LabSet[] = [
  {
    id: "radii",
    title: "Corner radii",
    task: "G-41 (#275)",
    question: "Does a smaller --radius-md make the controls read more like road signs?",
    specimen: "ui",
    variants: [
      { id: "a", name: "A · Current", note: "The live radii from app/tokens.css." },
      {
        id: "b",
        name: "B · Sharper controls",
        note: "Buttons, inputs, tiles and callouts (rounded-md) at 4 px. Badges and cards keep their live radius.",
        tokens: { "--radius-md": "4px" },
      },
    ],
    outcome:
      "A stays. B only changes the controls that use rounded-md, and at 4 px they match badges (sm) instead of standing apart from them. How many radii to keep is G-49 (#283).",
  },
];

export function getLabSet(id: string | undefined): LabSet {
  return LAB_SETS.find((s) => s.id === id) ?? LAB_SETS[0];
}

/** The overrides one variant sets in one theme. */
export function variantOverrides(variant: LabVariant, theme: LabTheme): TokenMap {
  return { ...variant.tokens, ...variant.byTheme?.[theme] };
}

