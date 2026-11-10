import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed, JetBrains_Mono } from "next/font/google";
import { AppProviders } from "@/components/app/providers";
import { THEME_INIT_SCRIPT } from "@/lib/theme-script";
import "./globals.css";

/*
 * Fonts. Barlow is inspired by highway signage, which fits the road theme.
 * To re-skin: swap these and keep the CSS variable names (tokens.css reads them).
 */
const body = Barlow({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600", "700"], variable: "--font-body" });
const heading = Barlow_Condensed({ subsets: ["latin", "latin-ext"], weight: ["600", "700"], variable: "--font-heading" });
const code = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-code" });

export const metadata: Metadata = {
  title: { default: "JolScan · Road photo to repair priority", template: "%s · JolScan" },
  description:
    "JolScan finds potholes in a road photo with a YOLO detector and turns them into a repair priority using rules you can read. ICT1103 course project at QAIRU.",
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
    <html lang="en" suppressHydrationWarning className={`${body.variable} ${heading.variable} ${code.variable}`}>
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
