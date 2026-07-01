import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { WizardRail } from "@/components/wizard-rail";
import { ensureDraft, saveRecipient, saveCareType, saveSchedule, saveLocation, postRequest } from "@/lib/actions/request";
import { CARE_CATEGORIES, SPECIALTIES, QUALIFICATIONS, QUALIFICATION_SHORT } from "@/lib/constants";
import { areaSuggestions } from "@/lib/geo";

export const metadata = { title: "Find care" };

const STEPS = [
  { n: 1, title: "Who needs care", sub: "The recipient" },
  { n: 2, title: "Type of care", sub: "What's needed" },
  { n: 3, title: "Schedule", sub: "When & how often" },
  { n: 4, title: "Location & budget", sub: "Where & range" },
  { n: 5, title: "Review", sub: "Post request" },
];

const RECIPIENTS = ["My parent", "My spouse", "Myself", "My child", "Someone else"];
const SCHEDULES = ["Weekday mornings", "Weekday full-day", "Nights", "Weekends", "24×7 live-in", "One-time visit"];
const TASKS = ["Wound dressing", "Vitals monitoring", "Bathing & hygiene", "Meal prep", "Physiotherapy support", "Injections", "Medication reminders"];

export default async function RequestWizard({ searchParams }: { searchParams: Promise<{ step?: string }> }) {
  const session = await requireSession("/login?next=/request/new");
  await ensureDraft();
  const draft = await db.careRequest.findFirstOrThrow({
    where: { familyId: session.userId, status: "DRAFT" },
    orderBy: { createdAt: "desc" },
  });

  let reached = 1;
  if (draft.notes?.startsWith("[For:")) reached = 2;
  if (draft.categories.length > 0) reached = Math.max(reached, 3);
  if (draft.schedule) reached = Math.max(reached, 4);
  if (draft.area || draft.budgetMin || draft.budgetMax) reached = Math.max(reached, 5);

  const requested = parseInt((await searchParams).step ?? String(reached), 10);
  const current = Math.min(Math.max(Number.isNaN(requested) ? reached : requested, 1), Math.max(reached, 1));

  const recipient = draft.notes?.match(/^\[For: ([^\]]*)\]/)?.[1] ?? "";
  const extraNotes = draft.notes?.replace(/^\[For: [^\]]*\]\n?/, "").replace(/^— /, "").trim() ?? "";

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <span className="eyebrow">Find care · Step 2 of the journey</span>
      <h1 className="text-3xl mt-1.5 mb-1">Tell us what you need</h1>
      <p className="text-muted text-sm mb-7 max-w-[66ch]">
        Each answer helps us match verified caregivers nearby. It&apos;s free — we introduce you, and you arrange care
        and payment with the caregiver directly.
      </p>

      <div className="grid md:grid-cols-[250px_1fr] gap-8 items-start">
        <WizardRail steps={STEPS} current={current} reached={reached} base="/request/new" />

        <div className="card" style={{ padding: 28 }}>
          <span className="pill pill-primary">Step {current} of 5</span>

          {current === 1 && (
            <form action={saveRecipient} className="mt-3">
              <h3 className="text-xl">Who is the care for?</h3>
              <div className="flex flex-wrap gap-2 mt-4">
                {RECIPIENTS.map((r) => (
                  <label key={r} className="chip">
                    <input type="radio" name="recipient" value={r} className="sr-only" defaultChecked={recipient === r} required />
                    {r}
                  </label>
                ))}
              </div>
              <Actions primaryLabel="Continue →" />
            </form>
          )}

          {current === 2 && (
            <form action={saveCareType} className="mt-3">
              <h3 className="text-xl">What kind of care is needed?</h3>
              <p className="text-muted text-sm mt-1.5">Pick everything that applies — we only match qualified caregivers.</p>
              <div className="mt-4">
                <label className="field-label">Care categories</label>
                <div className="flex flex-wrap gap-2">
                  {CARE_CATEGORIES.map((c) => (
                    <label key={c} className="chip">
                      <input type="checkbox" name="categories" value={c} className="sr-only" defaultChecked={draft.categories.includes(c)} />
                      {c}
                    </label>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <label className="field-label">Specific tasks (optional)</label>
                <div className="flex flex-wrap gap-2">
                  {TASKS.map((t) => (
                    <label key={t} className="chip">
                      <input type="checkbox" name="tasks" value={t} className="sr-only" defaultChecked={draft.tasks.includes(t)} />
                      {t}
                    </label>
                  ))}
                </div>
              </div>
              <div className="mt-4 max-w-sm">
                <label className="field-label" htmlFor="qualification">Preferred caregiver type</label>
                <select id="qualification" name="qualification" className="select" defaultValue={draft.qualification ?? ""}>
                  <option value="">Any qualified caregiver</option>
                  {QUALIFICATIONS.map((q) => <option key={q.value} value={q.value}>{q.label}</option>)}
                </select>
              </div>
              <Actions primaryLabel="Continue →" backStep={1} />
            </form>
          )}

          {current === 3 && (
            <form action={saveSchedule} className="mt-3">
              <h3 className="text-xl">When do you need care?</h3>
              <div className="flex flex-wrap gap-2 mt-4">
                {SCHEDULES.map((s) => (
                  <label key={s} className="chip">
                    <input type="radio" name="schedule" value={s} className="sr-only" defaultChecked={draft.schedule === s} required />
                    {s}
                  </label>
                ))}
              </div>
              <Actions primaryLabel="Continue →" backStep={2} />
            </form>
          )}

          {current === 4 && (
            <form action={saveLocation} className="mt-3">
              <h3 className="text-xl">Where, and your budget</h3>
              <div className="mt-4 grid gap-4">
                <div className="max-w-sm">
                  <label className="field-label" htmlFor="area">Area (Bengaluru)</label>
                  <input id="area" name="area" className="input" list="areas" defaultValue={draft.area ?? ""} placeholder="e.g. Koramangala" />
                  <datalist id="areas">
                    {areaSuggestions().map((a) => <option key={a} value={a} />)}
                  </datalist>
                </div>
                <div>
                  <label className="field-label">Budget (₹ / hour) — optional</label>
                  <div className="flex items-center gap-3 max-w-sm">
                    <input name="budgetMin" type="number" min={0} step={10} className="input num" defaultValue={draft.budgetMin ?? ""} placeholder="Min" />
                    <span className="text-faint">to</span>
                    <input name="budgetMax" type="number" min={0} step={10} className="input num" defaultValue={draft.budgetMax ?? ""} placeholder="Max" />
                  </div>
                </div>
                <div>
                  <label className="field-label" htmlFor="notes">Anything the caregiver should know?</label>
                  <textarea id="notes" name="notes" rows={3} className="textarea" defaultValue={extraNotes} placeholder="e.g. Recovering from hip surgery, needs wound care and help to follow-up visits." />
                </div>
              </div>
              <Actions primaryLabel="Review →" backStep={3} />
            </form>
          )}

          {current === 5 && (
            <form action={postRequest} className="mt-3">
              <h3 className="text-xl">Review your request</h3>
              <dl className="mt-4 grid gap-2.5 text-sm">
                <Row k="For" v={recipient || "—"} />
                <Row k="Care" v={draft.categories.join(", ") || "—"} />
                {draft.tasks.length > 0 && <Row k="Tasks" v={draft.tasks.join(", ")} />}
                <Row k="Caregiver" v={draft.qualification ? QUALIFICATION_SHORT[draft.qualification] : "Any qualified caregiver"} />
                <Row k="When" v={draft.schedule ?? "—"} />
                <Row k="Where" v={draft.area ? `${draft.area}, Bengaluru` : "Bengaluru"} />
                <Row k="Budget" v={draft.budgetMin || draft.budgetMax ? `₹${draft.budgetMin ?? "?"}–${draft.budgetMax ?? "?"}/hr` : "Flexible"} />
                {extraNotes && <Row k="Notes" v={extraNotes} />}
              </dl>
              <div className="mt-5 rounded-[10px] p-4 text-[13px]" style={{ background: "var(--color-accent-soft)", border: "1px solid #F0D6C6", color: "#8a4426" }}>
                💸 Kindred Care never handles payment. We introduce you to matching caregivers — you agree the schedule
                and fee directly with them.
              </div>
              <Actions primaryLabel="Post request & see matches →" backStep={4} />
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-3">
      <dt className="w-24 flex-none text-faint">{k}</dt>
      <dd className="text-ink font-medium">{v}</dd>
    </div>
  );
}

function Actions({ primaryLabel, backStep }: { primaryLabel: string; backStep?: number }) {
  return (
    <div className="flex items-center justify-between mt-6 pt-5 border-t border-line-2">
      {backStep ? <a href={`/request/new?step=${backStep}`} className="btn btn-ghost">← Back</a> : <span />}
      <button className="btn btn-primary" type="submit">{primaryLabel}</button>
    </div>
  );
}
