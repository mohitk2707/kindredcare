import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureCaregiverProfile, saveAccount, saveProfile, saveCredentials, saveServices, saveAvailability } from "@/lib/actions/caregiver";
import { StepsRail } from "@/components/onboarding/steps-rail";
import { DocUpload } from "@/components/doc-upload";
import { QUALIFICATIONS, LANGUAGES, SPECIALTIES, TIME_BLOCKS, WEEKDAYS } from "@/lib/constants";

export const metadata = { title: "Caregiver onboarding" };

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>;
}) {
  const session = await requireRole("CAREGIVER", "/login?intent=caregiver&next=/onboarding/caregiver");
  await ensureCaregiverProfile();

  const profile = await db.caregiverProfile.findUniqueOrThrow({
    where: { userId: session.userId },
    include: { user: true, credentials: true, availability: true },
  });

  const reached = profile.onboardingStep;
  const requested = parseInt((await searchParams).step ?? String(reached), 10);
  const current = Math.min(Math.max(Number.isNaN(requested) ? reached : requested, 1), Math.max(reached, 1));

  const credUrl = (type: string) => profile.credentials.find((c) => c.type === type)?.fileUrl ?? null;
  const availSet = new Set(profile.availability.map((a) => `${a.weekday}:${a.block}`));

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <span className="eyebrow">Journey · Step 1</span>
      <h1 className="text-3xl mt-1.5 mb-1">Caregiver onboarding</h1>
      <p className="text-muted text-sm mb-7 max-w-[66ch]">
        From profile to verified, discoverable partner. No joining fee; leads are free.
      </p>

      <div className="grid md:grid-cols-[250px_1fr] gap-8 items-start">
        <StepsRail current={current} reached={reached} />

        <div className="card" style={{ padding: 28 }}>
          <span className="pill pill-primary">Step {current} of 5</span>

          {current === 1 && (
            <form action={saveAccount} className="mt-3">
              <h3 className="text-xl">Welcome — let&apos;s start with your name</h3>
              <p className="text-muted text-sm mt-1.5">This is how families will see you. Your number {profile.user.phone} is already verified.</p>
              <div className="mt-4.5" style={{ marginTop: 18 }}>
                <label className="field-label" htmlFor="name">Full name</label>
                <input id="name" name="name" className="input" defaultValue={profile.user.name ?? ""} placeholder="e.g. Anjali Menon" required />
              </div>
              <Actions primaryLabel="Continue →" />
            </form>
          )}

          {current === 2 && (
            <form action={saveProfile} className="mt-3">
              <h3 className="text-xl">Tell families about your work</h3>
              <div className="mt-4.5 grid gap-4" style={{ marginTop: 18 }}>
                <div>
                  <label className="field-label" htmlFor="qualification">Qualification</label>
                  <select id="qualification" name="qualification" className="select" defaultValue={profile.qualification}>
                    {QUALIFICATIONS.map((q) => <option key={q.value} value={q.value}>{q.label}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="field-label" htmlFor="experienceYears">Years of experience</label>
                    <input id="experienceYears" name="experienceYears" type="number" min={0} max={60} className="input num" defaultValue={profile.experienceYears} />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="area">Area (Bengaluru)</label>
                    <input id="area" name="area" className="input" defaultValue={profile.area ?? ""} placeholder="e.g. Koramangala" />
                  </div>
                </div>
                <div>
                  <label className="field-label">Languages spoken</label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map((l) => (
                      <label key={l} className="chip">
                        <input type="checkbox" name="languages" value={l} className="sr-only" defaultChecked={profile.languages.includes(l)} />
                        {l}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="field-label" htmlFor="bio">Short bio</label>
                  <textarea id="bio" name="bio" rows={3} className="textarea" defaultValue={profile.bio ?? ""} placeholder="What kind of care do you provide? What should families know about you?" />
                </div>
              </div>
              <Actions primaryLabel="Continue →" backStep={1} />
            </form>
          )}

          {current === 3 && (
            <form action={saveCredentials} className="mt-3">
              <h3 className="text-xl">Verify your credentials</h3>
              <p className="text-muted text-sm mt-1.5">Verification earns the badge families trust. We check every document before your profile becomes discoverable.</p>
              <div className="mt-4.5 grid gap-4" style={{ marginTop: 18 }}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="field-label" htmlFor="councilRegNo">Nursing council reg. no.</label>
                    <input id="councilRegNo" name="councilRegNo" className="input" defaultValue={profile.councilRegNo ?? ""} placeholder="e.g. KA-RN-88214" />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="councilName">Issuing council</label>
                    <input id="councilName" name="councilName" className="input" defaultValue={profile.councilName ?? ""} placeholder="Karnataka State Nursing Council" />
                  </div>
                </div>
                <DocUpload name="file_aadhaar" label="Aadhaar / Govt ID" initialUrl={credUrl("AADHAAR")} />
                <DocUpload name="file_council" label="Nursing council registration" hint="Skip if you are a non-clinical attendant" initialUrl={credUrl("COUNCIL_REG")} />
                <DocUpload name="file_cert" label="Additional certificate (optional)" hint="BLS, CPR, specialty certificates" initialUrl={credUrl("CERTIFICATE")} />
              </div>
              <Actions primaryLabel="Submit & continue →" backStep={2} />
            </form>
          )}

          {current === 4 && (
            <form action={saveServices} className="mt-3">
              <h3 className="text-xl">What do you offer?</h3>
              <div className="mt-4.5 grid gap-4" style={{ marginTop: 18 }}>
                <div>
                  <label className="field-label">Specialties</label>
                  <div className="flex flex-wrap gap-2">
                    {SPECIALTIES.map((s) => (
                      <label key={s} className="chip">
                        <input type="checkbox" name="specialties" value={s} className="sr-only" defaultChecked={profile.specialties.includes(s)} />
                        {s}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="max-w-[240px]">
                  <label className="field-label" htmlFor="indicativeRate">Indicative rate (₹ / hour)</label>
                  <input id="indicativeRate" name="indicativeRate" type="number" min={100} max={5000} step={10} className="input num" defaultValue={profile.indicativeRate ?? ""} placeholder="e.g. 450" />
                  <p className="text-xs text-faint mt-1.5">Shown to families as a guide. You settle the final amount directly — Kindred Care never handles payment.</p>
                </div>
              </div>
              <Actions primaryLabel="Continue →" backStep={3} />
            </form>
          )}

          {current === 5 && (
            <form action={saveAvailability} className="mt-3">
              <h3 className="text-xl">When are you available?</h3>
              <p className="text-muted text-sm mt-1.5">Pick the blocks you can usually work. You can change this anytime.</p>
              <div className="mt-4.5 overflow-x-auto" style={{ marginTop: 18 }}>
                <table className="w-full border-separate" style={{ borderSpacing: "6px" }}>
                  <thead>
                    <tr>
                      <th></th>
                      {TIME_BLOCKS.map((b) => <th key={b.value} className="text-xs text-faint font-semibold uppercase tracking-wide">{b.label}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {WEEKDAYS.map((d) => (
                      <tr key={d.value}>
                        <td className="text-sm font-semibold text-muted pr-2">{d.short}</td>
                        {TIME_BLOCKS.map((b) => {
                          const token = `${d.value}:${b.value}`;
                          return (
                            <td key={b.value}>
                              <label className="chip w-full justify-center">
                                <input type="checkbox" name="availability" value={token} className="sr-only" defaultChecked={availSet.has(token)} />
                                <span aria-hidden>✓</span>
                              </label>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Actions primaryLabel="Finish & go to dashboard" backStep={4} />
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Actions({ primaryLabel, backStep }: { primaryLabel: string; backStep?: number }) {
  return (
    <div className="flex items-center justify-between mt-6 pt-5 border-t border-line-2">
      {backStep ? (
        <a href={`/onboarding/caregiver?step=${backStep}`} className="btn btn-ghost">← Back</a>
      ) : (
        <span />
      )}
      <button className="btn btn-primary" type="submit">{primaryLabel}</button>
    </div>
  );
}
