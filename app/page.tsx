import Link from "next/link";
import { Avatar } from "@/components/avatar";

const featured = [
  { initials: "AM", color: "#0F766E", name: "Anjali Menon", role: "Registered Nurse (RN, RM) · 8 yrs", rating: "4.9 (127)", rate: "₹550" },
  { initials: "LR", color: "#DA7F5D", name: "Lakshmi Reddy", role: "Home Attendant · 5 yrs", rating: "5.0 (61)", rate: "₹220" },
];

const categories = [
  { icon: "🏥", title: "Skilled nursing", sub: "RN / GNM · wound & post-op care" },
  { icon: "🧓", title: "Elderly & dementia", sub: "Companionship & memory care" },
  { icon: "🩹", title: "Post-surgical", sub: "Recovery & rehab support" },
  { icon: "👶", title: "Newborn & mother care", sub: "Night nurses & japa maids" },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 pt-9 pb-20">
      <section className="grid lg:grid-cols-[1.05fr_.95fr] gap-12 items-center py-3">
        <div>
          <span className="eyebrow">Vetted care, matched to your home</span>
          <h1 className="text-[clamp(34px,6vw,52px)] tracking-[-0.02em] mt-2">
            Find a nurse who feels like <em className="italic text-primary">kindred</em>, not a stranger.
          </h1>
          <p className="text-lg text-muted mt-4 max-w-[46ch]">
            Kindred Care connects families with background-checked nurses, aides, and home-care professionals — matched
            by need, schedule, and neighbourhood in minutes.
          </p>
          <div className="flex flex-wrap gap-3 mt-7">
            <Link href="/request/new" className="btn btn-primary">Find care →</Link>
            <Link href="/onboarding/caregiver" className="btn btn-ghost">Register as a caregiver</Link>
          </div>
          <p className="text-sm text-faint mt-3.5 flex items-center gap-2">
            🤝 <span>Free to use — we introduce you to caregivers. You arrange timing &amp; payment with them directly.</span>
          </p>
          <div className="flex flex-wrap gap-7 mt-7">
            {[
              { b: "6,400+", s: "Verified caregivers" },
              { b: "4.9★", s: "Avg. family rating" },
              { b: "100%", s: "ID & council checked" },
            ].map((t) => (
              <div key={t.s} className="flex flex-col">
                <b className="font-serif-display text-2xl num">{t.b}</b>
                <span className="text-xs text-faint">{t.s}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3.5">
          {featured.map((c) => (
            <div key={c.initials} className="card" style={{ padding: 18 }}>
              <div className="flex items-center gap-3.5">
                <Avatar initials={c.initials} color={c.color} size={52} />
                <div className="flex-1">
                  <h3 className="text-base flex items-center gap-2">
                    {c.name} <span className="pill pill-verified">✓ Verified</span>
                  </h3>
                  <div className="text-[13px] text-primary-deep font-semibold">{c.role}</div>
                  <div className="stars mt-1">
                    ★★★★★ <span className="text-muted font-sans text-xs">{c.rating}</span>
                  </div>
                </div>
                <div className="font-serif-display text-lg">
                  {c.rate}
                  <span className="text-[11px] text-faint">/hr</span>
                </div>
              </div>
            </div>
          ))}
          <div className="card text-white" style={{ padding: 18, background: "var(--color-primary)", borderColor: "var(--color-primary)" }}>
            <div className="flex items-center gap-3">
              <div className="text-2xl">🔔</div>
              <div className="text-[13.5px] leading-snug">
                <b>3 caregivers</b> matched a request for post-surgical care in Koramangala. They reach out within 2 hrs.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16">
        <span className="eyebrow">How it works</span>
        <div className="grid md:grid-cols-2 gap-4 mt-5">
          <PathCard
            title="👨‍👩‍👧 For families"
            steps={[
              ["Tell us what you need", "care type, schedule, and location."],
              ["Get matched", "with verified caregivers nearby, ranked by fit."],
              ["Connect directly", "we share contacts; you agree timing & pay the caregiver directly."],
            ]}
            cta={{ href: "/request/new", label: "Start a care request", accent: false }}
          />
          <PathCard
            title="🩺 For caregivers"
            steps={[
              ["Build your profile", "credentials, specialties, and indicative rates."],
              ["Get verified", "Aadhaar and nursing-council registration."],
              ["Receive leads free", "respond to families whose needs match your skills."],
            ]}
            cta={{ href: "/onboarding/caregiver", label: "Register as a caregiver", accent: true }}
          />
        </div>
      </section>

      <section className="mt-11">
        <span className="eyebrow">Care categories</span>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5">
          {categories.map((c) => (
            <Link key={c.title} href="/caregivers/bengaluru" className="card flex flex-col gap-2 hover:border-primary transition" style={{ padding: 18 }}>
              <span className="text-[22px]">{c.icon}</span>
              <b className="text-[15px]">{c.title}</b>
              <span className="text-[12.5px] text-faint">{c.sub}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function PathCard({
  title,
  steps,
  cta,
}: {
  title: string;
  steps: [string, string][];
  cta: { href: string; label: string; accent: boolean };
}) {
  return (
    <div className="card" style={{ padding: 24 }}>
      <h3 className="text-[19px] flex items-center gap-2.5">{title}</h3>
      <ol className="mt-4 grid gap-3 list-none p-0">
        {steps.map(([b, rest], i) => (
          <li key={b} className="flex gap-3 text-sm text-muted">
            <span className="flex-none w-6 h-6 rounded-full grid place-items-center text-xs font-bold text-primary-deep" style={{ background: "var(--color-primary-tint)" }}>
              {i + 1}
            </span>
            <span>
              <b className="text-ink font-semibold">{b}</b> — {rest}
            </span>
          </li>
        ))}
      </ol>
      <Link href={cta.href} className={`btn btn-sm ${cta.accent ? "btn-accent" : "btn-ghost"}`} style={{ marginTop: 18 }}>
        {cta.label}
      </Link>
    </div>
  );
}
