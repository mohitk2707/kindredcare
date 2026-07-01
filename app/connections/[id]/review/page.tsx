import { notFound, redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { submitReview } from "@/lib/actions/review";

export const metadata = { title: "Leave a review" };

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  const { id } = await params;

  const conn = await db.connection.findUnique({
    where: { id },
    include: { caregiver: { include: { user: true } }, review: true },
  });
  if (!conn) notFound();
  if (conn.familyId !== session.userId || conn.review) redirect(`/connections/${id}`);

  return (
    <div className="mx-auto max-w-md px-6 py-14">
      <span className="eyebrow">Feedback</span>
      <h1 className="text-3xl mt-1.5 mb-1">Rate {conn.caregiver.user.name}</h1>
      <p className="text-muted text-sm mb-6">Your honest review helps other families choose with confidence.</p>

      <form action={submitReview} className="card" style={{ padding: 24 }}>
        <input type="hidden" name="connectionId" value={id} />
        <fieldset>
          <legend className="field-label">Your rating</legend>
          <div className="rate-stars flex gap-2 flex-row-reverse justify-end">
            {[5, 4, 3, 2, 1].map((n) => (
              <label key={n} className="cursor-pointer text-3xl leading-none rate-star" title={`${n} star${n > 1 ? "s" : ""}`}>
                <input type="radio" name="rating" value={n} className="sr-only" required />
                <span className="rate-star-glyph">★</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-5">
          <label className="field-label" htmlFor="text">Anything to add? (optional)</label>
          <textarea id="text" name="text" rows={4} className="textarea" placeholder="How was the care? Punctual, skilled, kind?" />
        </div>

        <button className="btn btn-primary w-full mt-5">Submit review</button>
      </form>
    </div>
  );
}
