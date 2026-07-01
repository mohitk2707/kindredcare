import Link from "next/link";
import { Avatar, initialsFrom } from "@/components/avatar";
import { QUALIFICATION_SHORT } from "@/lib/constants";

const AVATAR_COLORS = ["#0F766E", "#3A6EA5", "#DA7F5D", "#7A5C9E", "#B9821A"];

export type ProviderCardData = {
  id: string;
  name: string | null;
  qualification: string;
  experienceYears: number;
  specialties: string[];
  languages: string[];
  area: string | null;
  city: string;
  indicativeRate: number | null;
  ratingAvg: number;
  ratingCount: number;
};

export function ProviderCard({
  p,
  score,
  distanceKm,
  connectHref,
  colorIndex = 0,
}: {
  p: ProviderCardData;
  score?: number;
  distanceKm?: number | null;
  connectHref: string;
  colorIndex?: number;
}) {
  const color = AVATAR_COLORS[colorIndex % AVATAR_COLORS.length];
  return (
    <div className="card grid grid-cols-[auto_1fr_auto] gap-4 items-center mb-3.5 hover:shadow-md transition" style={{ padding: 18 }}>
      <Avatar initials={initialsFrom(p.name)} color={color} size={64} />
      <div>
        <h3 className="text-[17px] flex items-center gap-2 flex-wrap">
          <Link href={`/caregiver/${p.id}`} className="hover:text-primary">{p.name ?? "Caregiver"}</Link>
          <span className="pill pill-verified">✓ Verified</span>
          {typeof score === "number" && (
            <span className={`pill ${score >= 90 ? "pill-accent" : "pill-primary"}`}>{score}% match</span>
          )}
        </h3>
        <div className="text-[13px] text-primary-deep font-semibold mt-0.5">
          {QUALIFICATION_SHORT[p.qualification]} · {p.experienceYears} yrs experience
        </div>
        <div className="flex gap-1.5 mt-2.5 flex-wrap">
          {p.specialties.slice(0, 3).map((s) => <span key={s} className="pill">{s}</span>)}
          {distanceKm != null && <span className="pill">{distanceKm.toFixed(1)} km away</span>}
        </div>
        <div className="flex items-center gap-2 mt-2.5 text-[13px] text-muted flex-wrap">
          <span className="stars">{"★".repeat(Math.round(p.ratingAvg))}{"☆".repeat(5 - Math.round(p.ratingAvg))}</span>
          <b className="num">{p.ratingAvg.toFixed(1)}</b>
          <span>· {p.ratingCount} reviews</span>
          {p.languages.length > 0 && <span>· {p.languages.slice(0, 3).join(", ")}</span>}
        </div>
      </div>
      <div className="text-right flex flex-col gap-2 items-end">
        {p.indicativeRate != null ? (
          <div>
            <div className="font-serif-display text-[21px] num">₹{p.indicativeRate}<span className="text-xs text-faint font-sans">/hr</span></div>
            <div className="text-[10.5px] text-faint uppercase tracking-wide -mt-1">Indicative</div>
          </div>
        ) : (
          <div className="text-[13px] text-faint">Rate on request</div>
        )}
        <Link href={connectHref} className="btn btn-primary btn-sm">Connect</Link>
        <Link href={`/caregiver/${p.id}`} className="btn btn-ghost btn-sm">View profile</Link>
      </div>
    </div>
  );
}
