import { Golos_Text, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";

/*
 * Fonts for the type trial (G-43). Loaded by the lab page only, never in
 * app/layout.tsx, so no other page downloads them. Each one only defines a CSS
 * variable; a variant in lib/design-lab.ts points --font-body or --font-code
 * at it. All three have the cyrillic and cyrillic-ext subsets, which hold the
 * Kazakh letters.
 */
const plexSans = IBM_Plex_Sans({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  variable: "--font-lab-plex-sans",
  display: "swap",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: ["400", "500"],
  variable: "--font-lab-plex-mono",
  display: "swap",
});
const golos = Golos_Text({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  variable: "--font-lab-golos",
  display: "swap",
});

/** Class names that define the lab font variables. */
export const LAB_FONT_VARIABLES = [plexSans.variable, plexMono.variable, golos.variable].join(" ");
