import Link from "next/link";

type RequestCard = {
  id: string;
  categories: string[];
  area: string | null;
  city: string;
  status: string;
  createdAt: Date;
  _count: { leads: number };
  connections: { caregiver: { user: { name: string | null } } }[];
};

export function RequestList({ requests }: { requests: RequestCard[] }) {
  if (requests.length === 0) {
    return (
      <div className="card text-center" style={{ padding: 40 }}>
        <p className="text-muted">You haven&apos;t posted a care request yet.</p>
        <Link href="/request/new" className="btn btn-primary mt-4 inline-flex">Start a care request</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-3.5">
      {requests.map((r) => (
        <Link key={r.id} href={`/request/${r.id}/matches`} className="card block hover:border-primary transition" style={{ padding: 18 }}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap gap-1.5 mb-1.5">
                {r.categories.slice(0, 3).map((c) => (
                  <span key={c} className="pill pill-primary">{c}</span>
                ))}
              </div>
              <div className="text-sm text-muted">
                {r.area ? `${r.area}, ` : ""}{r.city}
              </div>
            </div>
            <div className="text-right">
              <span className={`pill ${r.status === "OPEN" ? "pill-warn" : "pill-verified"}`}>{r.status}</span>
              <div className="text-[13px] text-muted mt-2">
                {r.connections.length > 0
                  ? `Connected with ${r.connections[0].caregiver.user.name ?? "a caregiver"}`
                  : `${r._count.leads} caregiver${r._count.leads === 1 ? "" : "s"} matched`}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
