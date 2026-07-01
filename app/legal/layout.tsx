import Link from "next/link";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <nav className="flex gap-4 text-sm mb-8">
        <Link href="/legal/privacy" className="text-primary-deep hover:underline">Privacy</Link>
        <Link href="/legal/terms" className="text-primary-deep hover:underline">Terms</Link>
        <Link href="/legal/grievance" className="text-primary-deep hover:underline">Grievance officer</Link>
      </nav>
      <div className="rounded-[10px] p-4 mb-8 text-[13px]" style={{ background: "var(--color-warn-soft)", border: "1px solid #EBD9AF", color: "#7a5a12" }}>
        ⚠️ Template for review. These pages must be checked and finalised by a lawyer before public launch. They reflect
        a connector-only model (no care provision, no payment handling) but are not a substitute for legal advice.
      </div>
      <article className="legal-prose">{children}</article>
    </div>
  );
}
