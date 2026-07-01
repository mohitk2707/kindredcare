import { db } from "@/lib/db";
import { scoreMatch, type MatchRequest, type Qual } from "@/lib/match";

export type DiscoveryFilters = {
  city?: string;
  qualifications?: Qual[];
  languages?: string[];
  maxRate?: number;
  minRating?: number;
};

export type ScoredCaregiver = Awaited<ReturnType<typeof getScoredCaregivers>>[number];

export async function getScoredCaregivers(req: MatchRequest, filters: DiscoveryFilters = {}) {
  const profiles = await db.caregiverProfile.findMany({
    where: {
      verificationStatus: "VERIFIED",
      city: filters.city ?? "Bengaluru",
      ...(filters.qualifications?.length ? { qualification: { in: filters.qualifications } } : {}),
      ...(filters.maxRate ? { OR: [{ indicativeRate: null }, { indicativeRate: { lte: filters.maxRate } }] } : {}),
      ...(filters.minRating ? { ratingAvg: { gte: filters.minRating } } : {}),
      ...(filters.languages?.length ? { languages: { hasSome: filters.languages } } : {}),
    },
    include: { user: true },
  });

  const scored = profiles.map((p) => {
    const result = scoreMatch(req, {
      qualification: p.qualification as Qual,
      specialties: p.specialties,
      lat: p.lat,
      lng: p.lng,
      indicativeRate: p.indicativeRate,
      ratingAvg: p.ratingAvg,
      ratingCount: p.ratingCount,
    });
    return { profile: p, ...result };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored;
}

export async function generateLeads(requestId: string): Promise<number> {
  const req = await db.careRequest.findUniqueOrThrow({ where: { id: requestId } });
  const scored = await getScoredCaregivers(
    {
      qualification: req.qualification as Qual | null,
      categories: req.categories,
      tasks: req.tasks,
      lat: req.lat,
      lng: req.lng,
      budgetMin: req.budgetMin,
      budgetMax: req.budgetMax,
    },
    { city: req.city }
  );

  const top = scored.filter((s) => s.score >= 30).slice(0, 12);
  for (const s of top) {
    await db.lead.upsert({
      where: { careRequestId_caregiverId: { careRequestId: requestId, caregiverId: s.profile.id } },
      update: { matchScore: s.score },
      create: { careRequestId: requestId, caregiverId: s.profile.id, matchScore: s.score },
    });
  }
  return top.length;
}
