import type { Metadata } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
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
      className={`${fraunces.variable} ${instrumentSans.variable} h-full antialiased`}
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
