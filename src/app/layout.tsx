import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { NetworkStatus } from "@/components/layout/network-status";
import { QueryProvider } from "@/components/layout/query-provider";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  // Every relative OG/twitter image resolves against this, so it must be the
  // deployed origin in production.
  metadataBase: new URL(appUrl),
  title: {
    default: "GearUp — Rent Sports & Outdoor Gear Instantly",
    template: "%s",
  },
  description:
    "Rent high-quality sports and outdoor equipment from trusted local providers. Browse gear, book by the day and pay securely with Stripe.",
  applicationName: "GearUp",
  keywords: [
    "gear rental",
    "outdoor equipment",
    "camping gear",
    "bike rental",
    "sports equipment hire",
  ],
  openGraph: {
    type: "website",
    siteName: "GearUp",
    url: appUrl,
    title: "GearUp — Rent Sports & Outdoor Gear Instantly",
    description:
      "Browse gear from local providers, book by the day and pay securely with Stripe.",
  },
  twitter: {
    card: "summary_large_image",
    title: "GearUp — Rent Sports & Outdoor Gear Instantly",
    description:
      "Browse gear from local providers, book by the day and pay securely with Stripe.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>{children}</QueryProvider>
          <NetworkStatus />
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
