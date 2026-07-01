import { notFound, redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Avatar, initialsFrom } from "@/components/avatar";
import { QUALIFICATION_SHORT } from "@/lib/constants";
import { createConnection } from "@/lib/actions/connect";

export const metadata = { title: "Connect" };

export default async function ConnectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ request?: string; error?: string }>;
}) {
  const { id } = await params;
  const { request, error } = await searchParams;
  const backHref = `/connect/${id}${request ? `?request=${request}` : ""}`;
  const session = await requireSession(`/login?next=${encodeURIComponent(backHref)}`);

  const p = await db.caregiverProfile.findUnique({ where: { id }, include: { user: true } });
  if (!p || p.verificationStatus !== "VERIFIED") notFound();

  const existing = await db.connection.findFirst({
    where: { caregiverId: id, familyId: session.userId, careRequestId: request ?? null },
  });
  if (existing) redirect(`/connections/${existing.id}`);

  const firstName = p.user.name?.split(" ")[0] ?? "the caregiver";
  const estimate = p.indicativeRate ? p.indicativeRate * 3 : null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <span className="eyebrow">Journey · Step 4</span>
      <h1 className="text-3xl mt-1.5 mb-1">Connect with {p.user.name}</h1>
      <p className="text-muted text-sm mb-6 max-w-[66ch]">
        Share your contact so {firstName} can reach you directly. Timing and payment are arranged between you —
        Kindred Care doesn&apos;t handle money or take a cut.
      </p>

      <div className="grid md:grid-cols-[1fr_360px] gap-6 items-start">
        <div className="card" style={{ padding: 28 }}>
          <div className="flex items-center gap-3.5 mb-5">
            <Avatar initials={initialsFrom(p.user.name)} size={56} />
            <div>
              <h3 className="text-lg">{p.user.name}</h3>
              <div className="text-sm text-muted flex items-center gap-2">
                <span className="stars">{"★".repeat(Math.round(p.ratingAvg))}</span>
                <b className="num">{p.ratingAvg.toFixed(1)}</b> · {p.ratingCount} reviews · {p.area ?? p.city}
              </div>
            </div>
          </div>

          <div className="rounded-[10px] p-4" style={{ background: "var(--color-primary-tint)" }}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[12px] uppercase tracking-wide text-faint font-bold">{firstName}&apos;s indicative rate</div>
                <div className="font-serif-display text-3xl num">
                  {p.indicativeRate ? `₹${p.indicativeRate}` : "On request"}
                  {p.indicativeRate ? <span className="text-sm text-muted font-sans"> /hour</span> : null}
                </div>
              </div>
              <span className="pill pill-primary">Set by caregiver</span>
            </div>
            {estimate && (
              <div className="text-[13px] text-muted mt-2 pt-2.5 flex justify-between" style={{ borderTop: "1px solid var(--color-primary-soft)" }}>
                <span>Estimate for a 3-hr visit</span>
                <b className="num">≈ ₹{estimate.toLocaleString("en-IN")}</b>
              </div>
            )}
          </div>

          <div className="flex gap-2.5 items-start rounded-[10px] p-3.5 mt-4 text-[13px]" style={{ background: "var(--color-accent-soft)", border: "1px solid #F0D6C6", color: "#8a4426" }}>
            💸 <span>This is only an estimate. You&apos;ll agree the final amount and <b>pay {firstName} directly</b> — Kindred Care never touches the money and charges you nothing.</span>
          </div>

          <form action={createConnection} className="mt-5">
            <input type="hidden" name="caregiverId" value={id} />
            {request && <input type="hidden" name="requestId" value={request} />}

            <label className="flex gap-3 items-start rounded-[10px] border border-line bg-surface-2 p-3.5 text-[13px] text-muted">
              <input type="checkbox" name="consent" style={{ accentColor: "var(--color-primary)", width: 17, height: 17, marginTop: 2, flex: "none" }} />
              <span>
                I agree to share my <b>name and phone number</b> with {p.user.name} so they can contact me about this
                care request, as described in the <a href="/legal/privacy" className="text-primary-deep underline">Privacy Policy</a> (DPDP consent).
              </span>
            </label>
            {error === "consent" && (
              <p className="text-sm text-warn mt-2">Please tick the consent box so we can share your contact.</p>
            )}
            <button className="btn btn-primary w-full mt-4" type="submit">Share contact &amp; connect</button>
          </form>
        </div>

        <aside className="card sticky top-[82px]" style={{ padding: 22 }}>
          <b className="text-[15px]">What happens next</b>
          <ol className="mt-3 grid gap-3 text-sm text-muted list-none p-0">
            {[
              "You consent to share your contact.",
              `${p.user.name} and you can see each other's phone number.`,
              "You arrange timing and fee directly — no payment on Kindred Care.",
            ].map((t, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="flex-none w-5 h-5 rounded-full grid place-items-center text-[11px] font-bold text-primary-deep" style={{ background: "var(--color-primary-tint)" }}>{i + 1}</span>
                {t}
              </li>
            ))}
          </ol>
          <p className="text-xs text-faint mt-4 text-center">🔒 We share contacts only with your consent. No payment is processed on Kindred Care.</p>
        </aside>
      </div>
    </div>
  );
}
