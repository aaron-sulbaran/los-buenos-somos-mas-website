import type { Metadata } from "next";
import { Fraunces, Instrument_Sans, Newsreader, Spectral } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/language-context";
import { SiteNav } from "@/components/nav/SiteNav";
import { LanguagePrompt } from "@/components/nav/LanguagePrompt";
import { SiteFooter } from "@/components/SiteFooter";

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
});

/**
 * Alternate display serifs, exposed only so the dev-only home page font
 * exploration can swap the display face. Production renders Fraunces; these
 * variables sit unused unless the dev toggle sets data-display-font.
 */
const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-newsreader-src",
  display: "swap",
});

const spectral = Spectral({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-spectral-src",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Los Buenos Somos Más",
  description:
    "Radical financial transparency for a citizen-led Venezuela earthquake relief fund. Every dollar received, every dollar distributed, with receipts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${instrumentSans.variable} ${newsreader.variable} ${spectral.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <LanguageProvider>
          <SiteNav />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <LanguagePrompt />
        </LanguageProvider>
      </body>
    </html>
  );
}
