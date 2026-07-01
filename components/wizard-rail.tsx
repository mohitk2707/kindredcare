import Link from "next/link";

export type WizardStep = { n: number; title: string; sub: string };

export function WizardRail({
  steps,
  current,
  reached,
  base,
}: {
  steps: WizardStep[];
  current: number;
  reached: number;
  base: string;
}) {
  return (
    <div className="grid gap-1 sticky top-[82px]">
      {steps.map((s) => {
        const done = s.n < current && s.n <= reached;
        const isCurrent = s.n === current;
        const navigable = s.n <= reached;
        const inner = (
          <div className={`flex gap-3.5 p-3 rounded-[10px] ${isCurrent ? "bg-surface border border-line shadow-sm" : ""}`}>
            <span
              className={`flex-none w-[26px] h-[26px] rounded-full grid place-items-center text-xs font-bold border-2 ${
                done ? "bg-good border-good text-white" : isCurrent ? "border-primary text-primary bg-surface" : "border-line text-faint bg-surface"
              }`}
            >
              {done ? "✓" : s.n}
            </span>
            <span>
              <b className="block text-[13.5px]">{s.title}</b>
              <span className="text-xs text-faint">{s.sub}</span>
            </span>
          </div>
        );
        return navigable ? (
          <Link key={s.n} href={`${base}?step=${s.n}`} className="block hover:opacity-90">{inner}</Link>
        ) : (
          <div key={s.n} className="opacity-70">{inner}</div>
        );
      })}
    </div>
  );
}
