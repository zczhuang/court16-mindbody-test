// Static Court 16 configuration. Hardcoded intentionally: a CMS for 6
// locations, a handful of dropdowns, and one waiver version would be
// overkill for Track 1. Change in code, redeploy, done.
//
// The vocabularies here (age bands, playing levels, lead sources,
// location values) MUST match the existing HubSpot form's internal
// values, since we submit to that form programmatically. Source of truth:
// https://share.hsforms.com/1PpZqxIcuSeybkx8RT6bTmw2vkiy (form GUID
// 3e966ac4-872e-49ec-9b93-1f114fa6d39b, portal 4832170). If Ibtissam
// edits the form options, update these constants too.

export const WAIVER_VERSION = "v1.0";

export interface LocationConfig {
  /** App-internal slug — used in URLs, logs, and the app's config lookups. */
  slug: string;
  /** Human-readable name shown in the UI. */
  displayName: string;
  /** The exact value the HubSpot form expects for `preferred_location`. */
  hubspotValue: string;
  /** Per-location MindBody Site ID. `-99` is the shared sandbox. */
  mindbodySiteId: string;
  /** Override staff notification email. Falls back to STAFF_NOTIFY_EMAIL env var. */
  staffNotifyEmailOverride?: string;
  /**
   * MindBody program IDs that count as trial-eligible kid classes at this
   * location. Leave empty until real per-location IDs are captured — empty
   * means "accept all classes" as a Track 1 default.
   */
  trialProgramIds: number[];
  /** Adult intro-eligible program IDs. Adults flow ships in a later slice. */
  introProgramIds: number[];
}

/**
 * The 6 Court 16 locations, matched to the existing HubSpot form values.
 * Site IDs default to `-99` sandbox — REPLACE with real production Site IDs
 * per location before flipping `MINDBODY_WRITE_MODE=live`. See Ideal-State
 * §13.1 access checklist.
 */
export const LOCATIONS: LocationConfig[] = [
  {
    slug: "long-island-city",
    displayName: "Long Island City, Queens",
    hubspotValue: "Long Island City, Queens",
    mindbodySiteId: "-99",
    trialProgramIds: [],
    introProgramIds: [],
  },
  {
    slug: "downtown-brooklyn",
    displayName: "Downtown Brooklyn",
    hubspotValue: "Gowanus, Brooklyn",
    mindbodySiteId: "-99",
    trialProgramIds: [],
    introProgramIds: [],
  },
  {
    slug: "manhattan-fidi",
    displayName: "FiDi — Manhattan",
    hubspotValue: "Manhattan-FiDi",
    mindbodySiteId: "-99",
    trialProgramIds: [],
    introProgramIds: [],
  },
  {
    slug: "fishtown-philly",
    displayName: "Fishtown — Philadelphia",
    hubspotValue: "Fishtown, Philadelphia",
    mindbodySiteId: "-99",
    trialProgramIds: [],
    introProgramIds: [],
  },
  {
    slug: "ridge-hill-yonkers",
    displayName: "Ridge Hill — Yonkers",
    hubspotValue: "Ridge Hill - Yonkers",
    mindbodySiteId: "-99",
    trialProgramIds: [],
    introProgramIds: [],
  },
  {
    slug: "newton-ma",
    displayName: "Newton — Massachusetts",
    hubspotValue: "Newton - Massachusetts",
    mindbodySiteId: "-99",
    trialProgramIds: [],
    introProgramIds: [],
  },
];

export function getLocation(slug: string): LocationConfig | undefined {
  return LOCATIONS.find((l) => l.slug === slug);
}

export interface OfferConfig {
  key: string;
  displayName: string;
  priceUsd: number;
  /** MindBody pricing option / service ID. Per-location — keyed by location slug. */
  mindbodyServiceIdByLocation: Record<string, number | undefined>;
}

/** Adult intro offers per Anthony's policy: no free adult trials. Kids flow doesn't use offers. */
export const OFFERS: OfferConfig[] = [
  {
    key: "tennis-intro-75",
    displayName: "Tennis Intro Special — $75",
    priceUsd: 75,
    mindbodyServiceIdByLocation: {},
  },
  {
    key: "pickleball-intro-58",
    displayName: "Pickleball Clinic Intro — $58",
    priceUsd: 58,
    mindbodyServiceIdByLocation: {},
  },
];

export function getOffer(key: string): OfferConfig | undefined {
  return OFFERS.find((o) => o.key === key);
}

// ─── HubSpot form dropdown vocabularies ──────────────────────────────────────
//
// These MUST match the existing form's option values. See
// https://share.hsforms.com/1PpZqxIcuSeybkx8RT6bTmw2vkiy.

/** Child age bands — values are what HubSpot's `childage` property stores. */
export const CHILD_AGE_BANDS = [
  { value: "2.5 - 3 yo", label: "2.5 – 3" },
  { value: "3 - 4 yo", label: "4" },
  { value: "5 - 6 yo", label: "5 – 6" },
  { value: "7 - 8 yo", label: "7 – 8" },
  { value: "9 - 11 yo", label: "9 – 11" },
  { value: "12 yo or older", label: "12 – 15" },
  { value: "15 and older", label: "15 and older" },
] as const;
export type ChildAgeBand = (typeof CHILD_AGE_BANDS)[number]["value"];
export const CHILD_AGE_BAND_VALUES = CHILD_AGE_BANDS.map((b) => b.value);

/** Playing level — values are what HubSpot's `child_1___playing_level` stores. */
export const PLAYING_LEVELS = [
  { value: "New to Tennis", label: "New to tennis" },
  { value: "Played a bit here and there", label: "Played a bit here and there" },
  { value: "Has taken formal lessons", label: "Has taken formal lessons" },
] as const;
export type PlayingLevel = (typeof PLAYING_LEVELS)[number]["value"];
export const PLAYING_LEVEL_VALUES = PLAYING_LEVELS.map((p) => p.value);

/** Lead source — values are what HubSpot's `lead_source` stores. */
export const LEAD_SOURCES = [
  "Word of Mouth",
  "Flyer",
  "Friend with a Court 16 member",
  "Google",
  "Facebook",
  "Instagram",
  "Other",
  "Events",
] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export const WAIVER_TEXT_SUMMARY =
  "I acknowledge Court 16's participation waiver and agree to its terms. Full text available on request.";
