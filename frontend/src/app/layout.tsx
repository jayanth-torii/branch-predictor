import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { ApiBaseSync } from "@/components/api-base-sync";
import { MobileBottomNav } from "@/components/mobile/bottom-nav";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Pathora AI — Discover the course that feels like you",
    template: "%s · Pathora AI",
  },
  description:
    "A gamified 25-question career discovery experience for PU students. Map your interests, explore 34 non-biology UG courses, and understand why each one fits.",
  keywords: [
    "PU career test",
    "UG course recommendation",
    "career discovery",
    "PUC students",
    "course matching",
  ],
};

/**
 * `viewportFit: "cover"` is what makes `env(safe-area-inset-*)` resolve to real
 * numbers on notched phones; without it every inset reads 0 and the bottom
 * navigation sits under the home indicator. `maximumScale` is deliberately
 * absent — capping zoom is an accessibility failure.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8F9FC" },
    { media: "(prefers-color-scheme: dark)", color: "#101B3D" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // `data-scroll-behavior` tells Next 16 that the `scroll-behavior: smooth`
    // in globals.css is intentional, so it can disable it during route
    // transitions instead of warning and smooth-scrolling every navigation.
    <html
      lang="en"
      data-theme="light"
      data-scroll-behavior="smooth"
      className={`${jakarta.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/*
          Runs before first paint so a returning dark-theme visitor never sees a
          white flash. It only ever writes the attribute React already rendered
          ("light") or "dark", which is why <html> carries
          suppressHydrationWarning — the server cannot know the stored choice.
          Light is the default for a first-time visitor, by product decision, so
          prefers-color-scheme is deliberately NOT consulted here.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("pathora-theme");if(t==="dark"){document.documentElement.setAttribute("data-theme","dark")}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-dvh">
        <div className="grain" aria-hidden="true" />
        <ApiBaseSync />
        <SiteHeader />
        {children}
        <MobileBottomNav />
      </body>
    </html>
  );
}
