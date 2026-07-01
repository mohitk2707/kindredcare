import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: {
    default: "Kindred Care — Verified nurses & home care in India",
    template: "%s · Kindred Care",
  },
  description:
    "Kindred Care connects Indian families with background-checked nurses, aides, and home-care professionals. We introduce you — you arrange care and payment directly.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-line mt-16">
          <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-faint flex flex-wrap gap-x-6 gap-y-2 justify-between">
            <span>© 2026 Kindred Care · A connector, not a care provider.</span>
            <span className="flex gap-5">
              <a href="/legal/privacy" className="hover:text-primary">Privacy</a>
              <a href="/legal/terms" className="hover:text-primary">Terms</a>
              <a href="/legal/grievance" className="hover:text-primary">Grievance officer</a>
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
