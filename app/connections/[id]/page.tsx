import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Avatar, initialsFrom } from "@/components/avatar";
import { QUALIFICATION_SHORT } from "@/lib/constants";

export const metadata = { title: "You're connected" };

export default async function ConnectionPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  const { id } = await params;

  const conn = await db.connection.findUnique({
    where: { id },
    include: {
      caregiver: { include: { user: true } },
      careRequest: true,
      review: true,
    },
  });
  if (!conn) notFound();

  const family = await db.user.findUnique({ where: { id: conn.familyId } });
  const isFamily = session.userId === conn.familyId;
  const isCaregiver = session.userId === conn.caregiver.userId;
  if (!isFamily && !isCaregiver && session.role !== "ADMIN") redirect("/");

  const cg = conn.caregiver;

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="flex gap-3 items-center rounded-[10px] px-4 py-3.5 mb-6" style={{ background: "var(--color-good-soft)", color: "#1f5e3d" }}>
        ✓ <span className="text-sm">You&apos;re connected. Reach out directly to arrange care.</span>
      </div>

      <h1 className="text-3xl mb-1">You can now contact each other</h1>
      <p className="text-muted text-sm mb-6">
        Timing and payment are arranged directly between you. Kindred Care doesn&apos;t process payments.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        <ContactCard
          initials={initialsFrom(cg.user.name)}
          name={cg.user.name ?? "Caregiver"}
          role={`${QUALIFICATION_SHORT[cg.qualification]} · ${cg.area ?? cg.city}`}
          phone={cg.user.phone}
          highlight={isFamily}
        />
        <ContactCard
          initials={initialsFrom(family?.name)}
          name={family?.name ?? "Family"}
          role={conn.careRequest?.area ? `${conn.careRequest.area}, Bengaluru` : "Family"}
          phone={family?.phone ?? ""}
          highlight={isCaregiver}
        />
      </div>

      {conn.careRequest && (
        <div className="card mt-4" style={{ padding: 16 }}>
          <div className="text-[12px] uppercase tracking-wide text-faint font-bold mb-1">Care request</div>
          <div className="text-sm">{conn.careRequest.categories.join(", ") || "Home care"} · {conn.careRequest.schedule ?? "Flexible"}</div>
          {conn.careRequest.notes && <p className="text-sm text-muted mt-1">{conn.careRequest.notes.replace(/^\[For: [^\]]*\]\n?/, "")}</p>}
        </div>
      )}

      <div className="flex gap-2.5 items-start rounded-[10px] p-3.5 mt-4 text-[13px]" style={{ background: "var(--color-accent-soft)", border: "1px solid #F0D6C6", color: "#8a4426" }}>
        💸 <span>Kindred Care never handles payment. Agree the schedule and fee directly. If anything feels off, contact our <a href="/legal/grievance" className="underline">grievance officer</a>.</span>
      </div>

      {isFamily && !conn.review && (
        <div className="card mt-5 flex items-center justify-between gap-4" style={{ padding: 18 }}>
          <div>
            <b>Worked with {cg.user.name?.split(" ")[0]}?</b>
            <p className="text-sm text-muted">Leave a review to help other families.</p>
          </div>
          <Link href={`/connections/${conn.id}/review`} className="btn btn-primary">Leave a review</Link>
        </div>
      )}
      {conn.review && (
        <p className="text-sm text-muted mt-5">You rated this caregiver {conn.review.rating}★. Thank you.</p>
      )}
    </div>
  );
}

function ContactCard({ initials, name, role, phone, highlight }: { initials: string; name: string; role: string; phone: string; highlight: boolean }) {
  return (
    <div className="card" style={{ padding: 18, ...(highlight ? { borderColor: "var(--color-primary-soft)" } : {}) }}>
      <div className="flex items-center gap-3">
        <Avatar initials={initials} size={44} />
        <div>
          <b className="text-[15px]">{name}</b>
          <div className="text-[12.5px] text-muted">{role}</div>
        </div>
      </div>
      <a href={`tel:${phone}`} className="btn btn-ghost btn-sm w-full mt-3 font-serif-display" style={{ fontSize: 16 }}>📞 {phone}</a>
    </div>
  );
}
