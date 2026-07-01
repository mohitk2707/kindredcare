export const metadata = { title: "Grievance Officer" };

export default function GrievancePage() {
  return (
    <>
      <h1>Grievance Officer</h1>
      <p className="updated">As required under the IT Act, 2000 (and rules) and the DPDP Act, 2023.</p>

      <p>
        If you have a complaint about content, conduct, or how your personal data is handled on Kindred Care, please
        contact our Grievance Officer. We aim to acknowledge every complaint within 24 hours and resolve it within 15
        days.
      </p>

      <h2>Contact</h2>
      <ul>
        <li><strong>Name:</strong> [Grievance Officer name]</li>
        <li><strong>Email:</strong> grievance@kindredcare.example</li>
        <li><strong>Address:</strong> [Registered office address], Bengaluru, Karnataka</li>
        <li><strong>Hours:</strong> Monday–Friday, 10:00–18:00 IST</li>
      </ul>

      <h2>What to include</h2>
      <ul>
        <li>Your name and contact number.</li>
        <li>A clear description of the issue and any relevant screenshots.</li>
        <li>The caregiver or family profile involved, if applicable.</li>
      </ul>

      <p>
        For data-protection requests (access, correction, erasure, or withdrawing consent to share your contact), mention
        &ldquo;DPDP request&rdquo; in your subject line so we can prioritise it.
      </p>
    </>
  );
}
