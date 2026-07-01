import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { RequestList } from "@/components/request-list";

export const metadata = { title: "My requests" };

export default async function FamilyDashboard() {
  const session = await requireRole("FAMILY");
  const requests = await db.careRequest.findMany({
    where: { familyId: session.userId, status: { not: "DRAFT" } },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { leads: true } },
      connections: { include: { caregiver: { include: { user: true } } } },
    },
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="eyebrow">Family dashboard</span>
          <h1 className="text-3xl mt-1">My care requests</h1>
        </div>
        <Link href="/request/new" className="btn btn-primary">New request</Link>
      </div>
      <RequestList requests={requests} />
    </div>
  );
}
