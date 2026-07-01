import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const caregivers = [
  {
    phone: "+919800000001", name: "Anjali Menon", qualification: "RN",
    councilName: "Karnataka State Nursing Council", councilRegNo: "KA-RN-88214", experienceYears: 8,
    bio: "Registered nurse specialising in post-surgical recovery, wound care, and vitals monitoring for home patients.",
    area: "Koramangala", lat: 12.9352, lng: 77.6245,
    languages: ["Hindi", "Malayalam", "English"],
    specialties: ["Post-surgical", "Wound care", "Vitals", "Medication management"],
    indicativeRate: 550, ratingAvg: 4.9, ratingCount: 127,
  },
  {
    phone: "+919800000002", name: "Sr. Grace Thomas", qualification: "RN",
    councilName: "Karnataka State Nursing Council", councilRegNo: "KA-RN-55120", experienceYears: 11,
    bio: "Senior nurse with over a decade in chronic and elderly care. Calm, patient, and thorough.",
    area: "HSR Layout", lat: 12.9116, lng: 77.6473,
    languages: ["Malayalam", "English", "Tamil"],
    specialties: ["Post-surgical", "Chronic care", "Elderly", "Vitals"],
    indicativeRate: 600, ratingAvg: 4.7, ratingCount: 208,
  },
  {
    phone: "+919800000003", name: "Farhan Sheikh", qualification: "GNM",
    councilName: "Karnataka State Nursing Council", councilRegNo: "KA-GNM-31904", experienceYears: 6,
    bio: "GNM nurse comfortable with injections, mobility support, and companionship for recovering patients.",
    area: "Indiranagar", lat: 12.9719, lng: 77.6412,
    languages: ["Hindi", "Kannada", "Urdu"],
    specialties: ["Mobility assistance", "Injections", "Companionship", "Meal prep"],
    indicativeRate: 350, ratingAvg: 4.8, ratingCount: 94,
  },
  {
    phone: "+919800000004", name: "Lakshmi Reddy", qualification: "ATTENDANT",
    councilName: null, councilRegNo: null, experienceYears: 5,
    bio: "Experienced home attendant for elderly companionship, bathing, hygiene, and daily-living support.",
    area: "Jayanagar", lat: 12.9299, lng: 77.5833,
    languages: ["Kannada", "Telugu", "Hindi"],
    specialties: ["Elderly companionship", "Bathing & hygiene", "Mobility assistance"],
    indicativeRate: 220, ratingAvg: 5.0, ratingCount: 61,
  },
];

async function main() {
  await db.user.upsert({
    where: { phone: "+919888888888" },
    update: { role: "ADMIN", name: "Kindred Admin" },
    create: { phone: "+919888888888", role: "ADMIN", name: "Kindred Admin" },
  });

  for (const c of caregivers) {
    const user = await db.user.upsert({
      where: { phone: c.phone },
      update: { role: "CAREGIVER", name: c.name },
      create: { phone: c.phone, role: "CAREGIVER", name: c.name },
    });

    const data = {
      qualification: c.qualification, councilName: c.councilName, councilRegNo: c.councilRegNo,
      experienceYears: c.experienceYears, bio: c.bio, city: "Bengaluru", area: c.area, lat: c.lat, lng: c.lng,
      languages: c.languages, specialties: c.specialties, indicativeRate: c.indicativeRate,
      onboardingStep: 5, verificationStatus: "VERIFIED", ratingAvg: c.ratingAvg, ratingCount: c.ratingCount,
    };
    const profile = await db.caregiverProfile.upsert({
      where: { userId: user.id },
      update: data,
      create: { userId: user.id, ...data },
    });

    await db.credential.deleteMany({ where: { caregiverId: profile.id } });
    const creds = [{ type: "AADHAAR", label: "Aadhaar / Govt ID" }];
    if (c.councilRegNo) creds.push({ type: "COUNCIL_REG", label: "Nursing council registration" });
    creds.push({ type: "POLICE", label: "Police verification" });
    for (const cr of creds) {
      await db.credential.create({ data: { caregiverId: profile.id, type: cr.type, label: cr.label, status: "VERIFIED" } });
    }

    await db.availability.deleteMany({ where: { caregiverId: profile.id } });
    for (let weekday = 1; weekday <= 5; weekday++) {
      await db.availability.create({ data: { caregiverId: profile.id, weekday, block: "MORNING" } });
    }
  }

  console.log(`Seeded admin + ${caregivers.length} verified caregivers.`);
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
