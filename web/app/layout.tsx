import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Overpass } from "next/font/google";
import { AppProviders } from "@/components/app/providers";
import { BRAND } from "@/lib/brand";
import { THEME_INIT_SCRIPT } from "@/lib/theme-script";
import "./globals.css";

/*
 * Fonts. Overpass is drawn after Highway Gothic, the road-sign lettering, which fits public
 * infrastructure, and unlike Barlow it has Cyrillic and every Kazakh letter (G-4).
 * To re-skin: swap these and keep the CSS variable names (tokens.css reads them).
 */
// Only preload the subset needed by the default English UI; other glyph ranges
// remain available through the generated font-face rules when text needs them.
const body = Overpass({ subsets: ["latin"], variable: "--font-body" });
const code = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-code" });

export const metadata: Metadata = {
  metadataBase: new URL("https://qarau.vercel.app"),
  title: { default: `${BRAND.name} · Infrastructure inspection from photos`, template: `%s · ${BRAND.name}` },
  description: BRAND.description,
  openGraph: { title: BRAND.name, description: BRAND.tagline, siteName: BRAND.name, type: "website" },
};

/** Browser UI colour. Mirrors --bg in tokens.css (metadata cannot read CSS variables). */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f2ee" },
    { media: "(prefers-color-scheme: dark)", color: "#121314" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${body.variable} ${code.variable}`}>
      <head>
        {/* Sets data-theme before paint so there is no light/dark flash. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-dvh">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
