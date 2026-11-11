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
  /** Live values of the colours this set varies, per theme (for the contrast numbers). */
  current?: Partial<Record<LabTheme, TokenMap>>;
  /** Show WCAG contrast numbers under each column. */
  contrast?: boolean;
  variants: LabVariant[];
  /** Which variant stays, and why. */
  outcome: string;
};

/** Current neutrals and accent, from app/tokens.css. */
export const CURRENT_PALETTE: Record<LabTheme, TokenMap> = {
  light: {
    "--bg": "#f3f2ee",
    "--surface": "#ffffff",
    "--surface-2": "#ebe9e3",
    "--surface-3": "#dfdcd4",
    "--inverse": "#1c1d1f",
    "--inverse-fg": "#f3f2ee",
    "--border": "#dad7cf",
    "--border-strong": "#b3afa4",
    "--fg": "#1b1c1e",
    "--muted": "#4f5156",
    "--subtle": "#66686d",
    "--accent": "#b87f00",
    "--accent-hover": "#c08a00",
    "--accent-fg": "#1b1c1e",
    "--accent-ink": "#855700",
    "--accent-soft": "#fbefd0",
  },
  dark: {
    "--bg": "#121314",
    "--surface": "#1a1b1d",
    "--surface-2": "#232427",
    "--surface-3": "#2d2f33",
    "--inverse": "#ecebe7",
    "--inverse-fg": "#121314",
    "--border": "#2f3135",
    "--border-strong": "#4a4d53",
    "--fg": "#ecebe7",
    "--muted": "#b1b2ae",
    "--subtle": "#8f908c",
    "--accent": "#ffb81c",
    "--accent-hover": "#ffc547",
    "--accent-fg": "#121314",
    "--accent-ink": "#ffc547",
    "--accent-soft": "#33280f",
  },
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
  {
    id: "palette",
    title: "Neutrals and accent",
    task: "G-46 (#280)",
    question: "Warm stone or cool graphite neutrals, and how dark should the amber be?",
    specimen: "ui",
    current: CURRENT_PALETTE,
    contrast: true,
    variants: [
      { id: "a", name: "A · Current", note: "Warm stone neutrals and road-sign amber with a dark label." },
      {
        id: "b",
        name: "B · Cool graphite",
        note: "Blue-grey neutrals, the same amber.",
        byTheme: {
          light: {
            "--bg": "#f1f3f5",
            "--surface-2": "#e8ebef",
            "--surface-3": "#dce0e5",
            "--inverse": "#1a1d21",
            "--inverse-fg": "#f1f3f5",
            "--border": "#d6dbe1",
            "--border-strong": "#aab1ba",
            "--fg": "#181b1f",
            "--muted": "#4a515a",
            "--subtle": "#616872",
            "--accent-fg": "#181b1f",
          },
          dark: {
            "--bg": "#101215",
            "--surface": "#171a1e",
            "--surface-2": "#20242a",
            "--surface-3": "#2a2f36",
            "--inverse": "#e9ecef",
            "--inverse-fg": "#101215",
            "--border": "#2b3037",
            "--border-strong": "#464d57",
            "--fg": "#e9ecef",
            "--muted": "#adb3ba",
            "--subtle": "#8b9199",
            "--accent-fg": "#101215",
          },
        },
      },
      {
        id: "c",
        name: "C · Deep amber",
        note: "Warm stone neutrals, a darker amber that carries a white label.",
        byTheme: {
          light: {
            "--accent": "#8a5a00",
            "--accent-hover": "#7a4f00",
            "--accent-fg": "#ffffff",
            "--accent-ink": "#7a4f00",
            "--accent-soft": "#f6e8c8",
          },
          dark: {
            "--accent": "#d99a12",
            "--accent-hover": "#e8a91f",
            "--accent-fg": "#121314",
            "--accent-ink": "#f0b84a",
            "--accent-soft": "#2e230d",
          },
        },
      },
    ],
    outcome:
      "A stays. All three pass every check below, so contrast alone does not decide it. B gains 0.08 to 0.31 on the text checks and loses the warm concrete-and-asphalt look. C has the most margin on the accent (5.93:1 as a mark in light, against 3.46:1), but its amber reads brown, close to the medium severity ink #7a4f0e, and the high-contrast theme in Settings already offers a dark amber (#7a4f00) to whoever needs it. The contrast audit (#380), the colour-blind check (#394) and the high-contrast theme (#419) were all measured on A."
  },
];

export function getLabSet(id: string | undefined): LabSet {
  return LAB_SETS.find((s) => s.id === id) ?? LAB_SETS[0];
}

/** The overrides one variant sets in one theme. */
export function variantOverrides(variant: LabVariant, theme: LabTheme): TokenMap {
  return { ...variant.tokens, ...variant.byTheme?.[theme] };
}

/** The colours one column ends up with: the live values, then the variant's overrides. Used for contrast. */
export function columnTokens(set: LabSet, variant: LabVariant, theme: LabTheme): TokenMap {
  return { ...set.current?.[theme], ...variantOverrides(variant, theme) };
}

/* ---------------------------------------------------------------------------
 * WCAG 2.x contrast
 * ------------------------------------------------------------------------- */

function parseHex(hex: string): [number, number, number] | null {
  const m = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** WCAG 2.x relative luminance of a #rrggbb colour. */
export function relativeLuminance(hex: string): number {
  const rgb = parseHex(hex);
  if (!rgb) throw new Error(`Not a #rrggbb colour: ${hex}`);
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.x contrast ratio, from 1 to 21. */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export type ContrastCheck = {
  label: string;
  /** Token drawn in front. */
  fg: string;
  /** Backgrounds it is checked on; the lowest ratio counts. */
  on: string[];
  /** WCAG target: 4.5 for text, 3 for marks (1.4.3 and 1.4.11). */
  min: number;
};

export const CONTRAST_CHECKS: ContrastCheck[] = [
  { label: "Text", fg: "--fg", on: ["--bg", "--surface"], min: 4.5 },
  { label: "Secondary text", fg: "--muted", on: ["--bg", "--surface"], min: 4.5 },
  { label: "Hints", fg: "--subtle", on: ["--bg", "--surface"], min: 4.5 },
  { label: "Amber text", fg: "--accent-ink", on: ["--bg", "--surface"], min: 4.5 },
  { label: "Accent as a mark", fg: "--accent", on: ["--surface"], min: 3 },
  { label: "Button label", fg: "--accent-fg", on: ["--accent"], min: 4.5 },
];

export type ContrastResult = ContrastCheck & { ratio: number; pass: boolean };

/** Lowest ratio of each check, rounded to two decimals. Checks with a missing or non-hex token are left out. */
export function contrastResults(tokens: TokenMap): ContrastResult[] {
  const out: ContrastResult[] = [];
  for (const check of CONTRAST_CHECKS) {
    const fg = tokens[check.fg];
    const backs = check.on.map((t) => tokens[t]);
    if (!fg || !parseHex(fg) || backs.some((b) => !b || !parseHex(b))) continue;
    const ratio = Math.min(...backs.map((b) => contrastRatio(fg, b)));
    const rounded = Math.round(ratio * 100) / 100;
    out.push({ ...check, ratio: rounded, pass: ratio >= check.min });
  }
  return out;
}
