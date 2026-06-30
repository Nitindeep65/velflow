import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToastProvider } from "@/components/ui/toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VelFlow | Enterprise AI Contract & Policy Compliance Guard",
  description: "Understand every clause before you sign. Premium AI CLM platform featuring instant risk audits, redline comparisons, webhook notifications, and automated playbook compliance guards.",
  keywords: [
    "AI Contract Review",
    "Contract Lifecycle Management",
    "CLM SaaS",
    "Legal AI co-pilot",
    "Playbook Compliance",
    "Contract Redlines",
    "E-signature",
    "Notice deadline tracker",
  ],
  authors: [{ name: "VelFlow Team" }],
  openGraph: {
    title: "VelFlow | Enterprise AI Contract & Policy Compliance Guard",
    description: "Understand every clause before you sign. Premium AI CLM platform featuring instant risk audits, redline comparisons, webhook notifications, and automated playbook compliance guards.",
    url: "https://velflow.dev",
    siteName: "VelFlow CLM",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VelFlow | Enterprise AI Contract & Policy Compliance Guard",
    description: "Understand every clause before you sign. Premium AI CLM platform featuring instant risk audits, redline comparisons, webhook notifications, and automated playbook compliance guards.",
    creator: "@velflow",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <TooltipProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}

