import type { Metadata, Viewport } from "next";
import { Inter, Newsreader } from "next/font/google";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { CookieBanner } from "@/components/CookieBanner";
import { SessionProvider } from "@/lib/session";
import { SITE } from "@/lib/site";
import { THEME_SCRIPT, ThemeProvider } from "@/lib/theme";
import "./globals.css";

const serif = Newsreader({ variable: "--font-serif", subsets: ["latin"], display: "swap", style: ["normal", "italic"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });

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
    { media: "(prefers-color-scheme: light)", color: "#fbf9f6" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0e0d" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${serif.variable} ${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col">
        <a href="#main" className="sr-only z-[80] rounded-lg bg-brand px-3 py-2 text-on-primary focus:not-sr-only focus:fixed focus:top-2 focus:left-2">
          Skip to content
        </a>
        <ThemeProvider>
          <SessionProvider>
            {children}
            <CookieBanner />
            <AnalyticsTracker />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
