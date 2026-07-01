export type Qual = "RN" | "GNM" | "ANM" | "ATTENDANT";

export type MatchRequest = {
  qualification?: Qual | null;
  categories: string[];
  tasks: string[];
  lat?: number | null;
  lng?: number | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
};

export type MatchCaregiver = {
  qualification: Qual;
  specialties: string[];
  lat?: number | null;
  lng?: number | null;
  indicativeRate?: number | null;
  ratingAvg: number;
  ratingCount: number;
};

const QUAL_RANK: Record<Qual, number> = { RN: 4, GNM: 3, ANM: 2, ATTENDANT: 1 };
const CLINICAL_HINTS = ["nursing", "surgical", "wound", "medication", "injection", "dementia", "vitals"];
const STOPWORDS = new Set(["care", "recovery", "assistance", "management", "support", "home", "general", "amp"]);

export function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

function tokens(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .split(/[^a-z]+/)
      .filter((w) => w.length > 3 && !STOPWORDS.has(w))
  );
}

function sharesToken(a: string, b: string): boolean {
  const ta = tokens(a);
  for (const t of tokens(b)) if (ta.has(t)) return true;
  return false;
}

function isClinical(items: string[]): boolean {
  return items.some((i) => CLINICAL_HINTS.some((h) => i.toLowerCase().includes(h)));
}

export type MatchResult = { score: number; distanceKm: number | null; matchedItems: string[] };

export function scoreMatch(req: MatchRequest, cg: MatchCaregiver): MatchResult {
  const reqItems = [...req.categories, ...req.tasks];

  let specialtyScore = 0;
  const matchedItems: string[] = [];
  if (reqItems.length === 0) {
    specialtyScore = 22;
  } else {
    for (const item of reqItems) {
      if (cg.specialties.some((sp) => sharesToken(item, sp))) matchedItems.push(item);
    }
    specialtyScore = (matchedItems.length / reqItems.length) * 45;
  }

  let qualScore: number;
  const needsClinical = isClinical(reqItems);
  if (needsClinical && cg.qualification === "ATTENDANT") {
    qualScore = 0;
  } else if (req.qualification) {
    if (cg.qualification === req.qualification) qualScore = 15;
    else if (QUAL_RANK[cg.qualification] > QUAL_RANK[req.qualification]) qualScore = 11;
    else qualScore = 5;
  } else {
    qualScore = 9;
  }

  let distanceKm: number | null = null;
  let distanceScore = 10;
  if (req.lat != null && req.lng != null && cg.lat != null && cg.lng != null) {
    distanceKm = haversineKm(req.lat, req.lng, cg.lat, cg.lng);
    distanceScore = Math.max(0, Math.min(20, 20 * (1 - distanceKm / 15)));
  }

  const conf = Math.min(cg.ratingCount, 50) / 50;
  const ratingScore = (cg.ratingAvg / 5) * 12 * conf + (1 - conf) * 6;

  let budgetScore = 4;
  if (cg.indicativeRate != null) {
    if (req.budgetMax != null && cg.indicativeRate > req.budgetMax) budgetScore = 0;
    else if (req.budgetMin != null && cg.indicativeRate < req.budgetMin) budgetScore = 6;
    else budgetScore = 8;
  }

  const score = Math.round(
    Math.max(0, Math.min(100, specialtyScore + qualScore + distanceScore + ratingScore + budgetScore))
  );
  return { score, distanceKm, matchedItems };
}
