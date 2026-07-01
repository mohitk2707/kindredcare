export const QUALIFICATIONS = [
  { value: "RN", label: "Registered Nurse & Midwife (RN, RM)" },
  { value: "GNM", label: "General Nursing & Midwifery (GNM)" },
  { value: "ANM", label: "Auxiliary Nurse Midwife (ANM)" },
  { value: "ATTENDANT", label: "Home Attendant / Caregiver (non-clinical)" },
] as const;

export const QUALIFICATION_SHORT: Record<string, string> = {
  RN: "Registered Nurse (RN, RM)",
  GNM: "GNM Nurse",
  ANM: "ANM Nurse",
  ATTENDANT: "Home Attendant",
};

export const CARE_CATEGORIES = [
  "Skilled nursing",
  "Post-surgical recovery",
  "Elderly companionship",
  "Dementia care",
  "Medication management",
  "Newborn & mother care",
  "Mobility assistance",
];

export const SPECIALTIES = [
  "Post-surgical",
  "Wound care",
  "Vitals",
  "Injections",
  "Medication management",
  "Chronic care",
  "Elderly companionship",
  "Dementia care",
  "Mobility assistance",
  "Bathing & hygiene",
  "Meal prep",
  "Newborn & mother care",
  "Physiotherapy support",
];

export const LANGUAGES = ["Hindi", "Kannada", "English", "Tamil", "Telugu", "Malayalam", "Urdu", "Marathi"];

export const TIME_BLOCKS = [
  { value: "MORNING", label: "Morning" },
  { value: "AFTERNOON", label: "Afternoon" },
  { value: "EVENING", label: "Evening" },
  { value: "NIGHT", label: "Night (12h)" },
];

export const WEEKDAYS = [
  { value: 1, short: "Mon" },
  { value: 2, short: "Tue" },
  { value: 3, short: "Wed" },
  { value: 4, short: "Thu" },
  { value: 5, short: "Fri" },
  { value: 6, short: "Sat" },
  { value: 0, short: "Sun" },
];

export const CITIES = ["Bengaluru"];

export const POLICY_VERSION = "2026-07-01";
