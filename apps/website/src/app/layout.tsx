import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LeadCaptureProvider } from "@/components/LeadCaptureProvider";

export const metadata: Metadata = {
  title: {
    default: "Gayatri Properties — Find Your Next Property",
    template: "%s | Gayatri Properties",
  },
  description:
    "Buy or rent apartments, villas, plots and commercial spaces across Thane — Vasant Vihar, Manpada, Majiwada, Ghodbunder Road and nearby areas.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col font-sans">
        <LeadCaptureProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </LeadCaptureProvider>
      </body>
    </html>
  );
}
