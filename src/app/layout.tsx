import type { Metadata } from "next";
import { headers } from "next/headers";
import { Archivo, Work_Sans, Space_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

const workSans = Work_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const archivo = Archivo({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
});

const spaceMono = Space_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Josue Garcia — Data & Database Portfolio",
  description:
    "Data analyst and database engineering portfolio, self-hosted on a home server.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Same signal middleware.ts uses to gate /admin: tailscaled only stamps
  // this header on requests from an authenticated tailnet peer, never on
  // public Funnel traffic. Shows the Admin nav link only when it's present,
  // so the link "auto-detects" whether you're on the tailnet.
  const isDev = process.env.NODE_ENV === "development";
  const hdrs = await headers();
  const isAdmin = isDev || hdrs.has("tailscale-user-login");

  return (
    <html
      lang="en"
      className={`${workSans.variable} ${archivo.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <NavBar isAdmin={isAdmin} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
