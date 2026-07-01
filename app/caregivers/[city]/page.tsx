import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { ProviderCard } from "@/components/provider-card";
import { SortSelect } from "@/components/sort-select";
import { QUALIFICATIONS, LANGUAGES } from "@/lib/constants";
import type { Prisma, Qualification } from "@prisma/client";

function cityName(slug: string): string {
  return slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase();
}

export async function generateStaticParams() {
  return [{ city: "bengaluru" }];
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params;
  const name = cityName(city);
  return {
    title: `Verified nurses & home caregivers in ${name}`,
    description: `Browse background-checked nurses, GNM/ANM caregivers, and home attendants in ${name}. Verified against the State Nursing Council. Free to connect — you pay the caregiver directly.`,
  };
}

function asArray(v?: string | string[]): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

export default async function DirectoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ city: string }>;
  searchParams: Promise<{ qual?: string | string[]; lang?: string | string[]; maxRate?: string; sort?: string }>;
}) {
  const { city } = await params;
  const sp = await searchParams;
  const name = cityName(city);

  const quals = asArray(sp.qual) as Qualification[];
  const langs = asArray(sp.lang);
  const maxRate = sp.maxRate ? parseInt(sp.maxRate, 10) : undefined;
  const sort = sp.sort ?? "rating";

  const where: Prisma.CaregiverProfileWhereInput = {
    verificationStatus: "VERIFIED",
    city: name,
    ...(quals.length ? { qualification: { in: quals } } : {}),
    ...(langs.length ? { languages: { hasSome: langs } } : {}),
    ...(maxRate ? { OR: [{ indicativeRate: null }, { indicativeRate: { lte: maxRate } }] } : {}),
  };

  const orderBy: Prisma.CaregiverProfileOrderByWithRelationInput =
    sort === "rate" ? { indicativeRate: "asc" } : sort === "experience" ? { experienceYears: "desc" } : { ratingAvg: "desc" };

  const profiles = await db.caregiverProfile.findMany({ where, orderBy, include: { user: true } });

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <span className="eyebrow">Verified caregivers</span>
      <h1 className="text-3xl mt-1.5 mb-1">Nurses &amp; home caregivers in {name}</h1>
      <p className="text-muted text-sm mb-6 max-w-[66ch]">
        Every caregiver here is ID- and nursing-council verified. Connecting is free — you agree the schedule and pay
        the caregiver directly.
      </p>

      <div className="grid md:grid-cols-[258px_1fr] gap-6 items-start">
        <form className="card sticky top-[82px]" style={{ padding: 20 }} method="get">
          <h4 className="text-[13px] uppercase tracking-wide text-faint font-semibold mb-3">Qualification</h4>
          <div className="grid gap-1.5">
            {QUALIFICATIONS.map((q) => (
              <label key={q.value} className="flex items-center gap-2.5 text-sm text-muted py-1">
                <input type="checkbox" name="qual" value={q.value} defaultChecked={quals.includes(q.value as Qualification)} style={{ accentColor: "var(--color-primary)", width: 16, height: 16 }} />
                {q.label.split(" (")[0]}
              </label>
            ))}
          </div>
          <div className="mt-5 pt-5 border-t border-line-2">
            <h4 className="text-[13px] uppercase tracking-wide text-faint font-semibold mb-2">Max rate — ₹{maxRate ?? 1000}/hr</h4>
            <input type="range" name="maxRate" min={150} max={1000} step={50} defaultValue={maxRate ?? 1000} style={{ width: "100%", accentColor: "var(--color-primary)" }} />
          </div>
          <div className="mt-5 pt-5 border-t border-line-2">
            <h4 className="text-[13px] uppercase tracking-wide text-faint font-semibold mb-2">Languages</h4>
            <div className="grid gap-1.5">
              {LANGUAGES.slice(0, 6).map((l) => (
                <label key={l} className="flex items-center gap-2.5 text-sm text-muted py-1">
                  <input type="checkbox" name="lang" value={l} defaultChecked={langs.includes(l)} style={{ accentColor: "var(--color-primary)", width: 16, height: 16 }} />
                  {l}
                </label>
              ))}
            </div>
          </div>
          <button className="btn btn-primary btn-sm w-full mt-5">Apply filters</button>
          <Link href={`/caregivers/${city}`} className="btn btn-ghost btn-sm w-full mt-2">Clear</Link>
        </form>

        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-muted"><b className="font-serif-display text-ink">{profiles.length}</b> caregiver{profiles.length === 1 ? "" : "s"}</div>
            <SortSelect value={sort} />
          </div>

          {profiles.length === 0 ? (
            <div className="card text-center" style={{ padding: 40 }}>
              <p className="text-muted">No caregivers match these filters yet.</p>
            </div>
          ) : (
            profiles.map((p, i) => (
              <ProviderCard key={p.id} p={{ ...p, name: p.user.name }} connectHref={`/connect/${p.id}`} colorIndex={i} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
