import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Nav from "@/components/site/Nav";
import Footer from "@/components/site/Footer";
import { MotionProvider } from "@/components/motion/primitives";
import Backdrop from "@/components/site/Backdrop";

// Cabinet Grotesk (Indian Type Foundry, Fontshare free licence), self-hosted variable file.
const cabinet = localFont({ src: "./fonts/CabinetGrotesk-Variable.woff2", variable: "--font-cabinet", weight: "100 900", display: "swap" });

export const metadata: Metadata = {
  // SITE_URL is set to the public domain once it is live; until then absolute URLs stay on the tailnet name.
  metadataBase: new URL(process.env.SITE_URL ?? "https://swe-2.tail174d56.ts.net"),
  // each page names its own path on SITE_URL as canonical, so the ts.net copy never competes with the domain
  alternates: { canonical: "./" },
  title: { default: "Josue Garcia · Database & Data Engineering", template: "%s · Josue Garcia" },
  description: "Database administration and data engineering work, built and run on a self-hosted stack.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${cabinet.variable} antialiased`}>
      <body className="relative flex min-h-dvh flex-col font-sans">
        <Backdrop />
        <MotionProvider>
          <a href="#main" className="act sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60]">
            Skip to content
          </a>
          <Nav />
          <main id="main" className="flex-1">{children}</main>
          <Footer />
        </MotionProvider>
      </body>
    </html>
  );
}
