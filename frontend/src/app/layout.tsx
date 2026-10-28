import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { CookieBanner } from "@/components/CookieBanner";
import { Cursor } from "@/components/fx/Cursor";
import { Sky } from "@/components/fx/Sky";
import { SessionProvider } from "@/lib/session";
import { SITE } from "@/lib/site";
import { THEME_SCRIPT, ThemeProvider } from "@/lib/theme";
import "./globals.css";

const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], display: "swap", axes: ["SOFT", "WONK"] });
const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name}: ${SITE.tagline}`, template: `%s | ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  openGraph: { type: "website", siteName: SITE.name, title: `${SITE.name}: ${SITE.tagline}`, description: SITE.description, url: "/" },
  twitter: { card: "summary_large_image", title: `${SITE.name}: ${SITE.tagline}`, description: SITE.description },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf8ff" },
    { media: "(prefers-color-scheme: dark)", color: "#130f22" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fraunces.variable} ${jakarta.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col">
        <a href="#main" className="sr-only z-[80] rounded-lg bg-violet px-3 py-2 text-on-primary focus:not-sr-only focus:fixed focus:top-2 focus:left-2">
          Skip to content
        </a>
        <ThemeProvider>
          <Sky />
          <SessionProvider>
            {children}
            <CookieBanner />
            <AnalyticsTracker />
          </SessionProvider>
          <Cursor />
        </ThemeProvider>
      </body>
    </html>
  );
}
