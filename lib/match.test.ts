import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreMatch, haversineKm, type MatchCaregiver, type MatchRequest } from "./match.ts";

const nurse: MatchCaregiver = {
  qualification: "RN",
  specialties: ["Post-surgical", "Wound care", "Vitals"],
  lat: 12.9352,
  lng: 77.6245,
  indicativeRate: 550,
  ratingAvg: 4.9,
  ratingCount: 127,
};

const attendant: MatchCaregiver = {
  qualification: "ATTENDANT",
  specialties: ["Elderly companionship", "Bathing & hygiene"],
  lat: 12.9352,
  lng: 77.6245,
  indicativeRate: 220,
  ratingAvg: 5.0,
  ratingCount: 61,
};

test("haversine gives a sane Bengaluru intra-city distance", () => {
  const km = haversineKm(12.9352, 77.6245, 12.9116, 77.6473);
  assert.ok(km > 2 && km < 6, `expected 2-6km, got ${km}`);
});

test("strong specialty + qualification match scores high", () => {
  const req: MatchRequest = {
    qualification: "RN",
    categories: ["Post-surgical recovery"],
    tasks: ["Wound dressing"],
    lat: 12.9352,
    lng: 77.6245,
    budgetMax: 600,
  };
  const { score } = scoreMatch(req, nurse);
  assert.ok(score >= 80, `expected >=80, got ${score}`);
});

test("clinical request scores an attendant very low on qualification", () => {
  const req: MatchRequest = {
    categories: ["Skilled nursing"],
    tasks: ["Wound dressing", "Injections"],
    lat: 12.9352,
    lng: 77.6245,
  };
  const nurseScore = scoreMatch(req, nurse).score;
  const attendantScore = scoreMatch(req, attendant).score;
  assert.ok(nurseScore > attendantScore + 20, `nurse ${nurseScore} should beat attendant ${attendantScore}`);
});

test("rate above budget max removes the budget bonus", () => {
  const base: MatchRequest = { categories: ["Elderly companionship"], tasks: [] };
  const within = scoreMatch({ ...base, budgetMax: 600 }, nurse).score;
  const over = scoreMatch({ ...base, budgetMax: 300 }, nurse).score;
  assert.ok(within > over, `within-budget ${within} should beat over-budget ${over}`);
});

test("distance reduces score as caregiver gets farther", () => {
  const req: MatchRequest = { categories: ["Post-surgical recovery"], tasks: [], lat: 12.9352, lng: 77.6245 };
  const near = scoreMatch(req, nurse).score;
  const far = scoreMatch(req, { ...nurse, lat: 13.2, lng: 77.9 }).score;
  assert.ok(near > far, `near ${near} should beat far ${far}`);
});
