export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p className="updated">Last updated 1 July 2026 · Policy version 2026-07-01</p>

      <p>
        Kindred Care (&ldquo;we&rdquo;) operates a platform that <strong>introduces families to independent nurses and
        home-care professionals</strong>. We are a connector — we do not provide care and we do not process payments.
        This policy explains what personal data we collect and how we handle it under India&apos;s Digital Personal Data
        Protection Act, 2023 (DPDP Act).
      </p>

      <h2>What we collect</h2>
      <ul>
        <li><strong>Families:</strong> your name, mobile number, and the details of your care request (care type, schedule, area, budget, and notes you choose to add).</li>
        <li><strong>Caregivers:</strong> your name, mobile number, qualification, nursing-council registration number, experience, languages, rates, and the verification documents you upload (Aadhaar/ID, council registration, certificates).</li>
        <li><strong>Usage:</strong> basic logs needed to run and secure the service.</li>
      </ul>

      <h2>Why we use it</h2>
      <ul>
        <li>To verify caregivers and display verified profiles to families.</li>
        <li>To match care requests with suitable caregivers nearby.</li>
        <li>To share contact details <strong>only after you explicitly consent</strong> on the &ldquo;Connect&rdquo; step.</li>
      </ul>

      <h2>Contact sharing &amp; consent</h2>
      <p>
        We never reveal your phone number to another user until you tick the consent box on the Connect screen. That
        consent is logged with a timestamp, purpose, and policy version. You can withdraw consent for future sharing at
        any time by contacting our grievance officer.
      </p>

      <h2>Your rights</h2>
      <p>
        Under the DPDP Act you may request access to, correction of, or erasure of your personal data, and you may
        nominate someone to exercise these rights. Write to our <a href="/legal/grievance">grievance officer</a>.
      </p>

      <h2>What we do not do</h2>
      <ul>
        <li>We do not collect or store payment or bank details — payments happen directly between you and the caregiver.</li>
        <li>We do not sell your personal data.</li>
      </ul>

      <h2>Retention</h2>
      <p>We keep your data only as long as needed to provide the service and to meet legal obligations, after which it is deleted or anonymised.</p>
    </>
  );
}
