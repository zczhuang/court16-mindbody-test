/**
 * Adult intro-offer configuration.
 *
 * Court 16 runs two adult intro packages per Anthony's policy:
 *   - Tennis Intro Special — $75
 *   - Pickleball Clinic Intro — $58
 *
 * Each location may offer both or just one. Each offer maps to a specific
 * MindBody "pricing option" / service ID per site. Staff populates the
 * `serviceIdByLocation` map once the real MindBody IDs are captured.
 */

export interface AdultOffer {
  key: "tennis-intro-75" | "pickleball-intro-58";
  displayName: string;
  priceUsd: number;
  subtitle: string;
  /** MindBody service / pricing option ID, keyed by location slug. */
  serviceIdByLocation: Record<string, number | undefined>;
}

export const ADULT_OFFERS: AdultOffer[] = [
  {
    key: "tennis-intro-75",
    displayName: "Tennis Intro Special",
    priceUsd: 75,
    subtitle: "One 60-minute tennis class with a Court 16 coach.",
    serviceIdByLocation: {
      brooklyn: undefined,
      lic: undefined,
      fidi: undefined,
      ridgehill: undefined,
      fishtown: undefined,
      newton: undefined,
    },
  },
  {
    key: "pickleball-intro-58",
    displayName: "Pickleball Clinic Intro",
    priceUsd: 58,
    subtitle: "One 45-minute pickleball clinic — all levels welcome.",
    serviceIdByLocation: {
      brooklyn: undefined,
      lic: undefined,
      fidi: undefined,
      ridgehill: undefined,
      fishtown: undefined,
      newton: undefined,
    },
  },
];

export function getOffer(key: string): AdultOffer | undefined {
  return ADULT_OFFERS.find((o) => o.key === key);
}

/**
 * MindBody `ClassDescription.Program.Name` values we consider "adult".
 * Used to filter the calendar for the adult flow. Until real production
 * data tells us the exact strings Court 16 uses, this list is permissive
 * and the `filterAdultOnly` helper falls back to "anything not in the
 * children allowlist" so sandbox / early-dev data still renders.
 */
export const ADULT_PROGRAM_NAMES: string[] = [
  "Adult Classes",
  "Adult Tennis",
  "Adult Pickleball",
  "Pickleball",
  "Intro Offer",
];

/** Returns true iff we're confident this class is an adult program. */
export function isAdultProgram(programName: string | undefined): boolean {
  if (!programName) return false;
  return ADULT_PROGRAM_NAMES.some(
    (p) => programName.toLowerCase().includes(p.toLowerCase()),
  );
}

/** Returns true iff this program is explicitly a children's program we should exclude. */
export function isChildrenProgram(programName: string | undefined): boolean {
  if (!programName) return false;
  const lower = programName.toLowerCase();
  return (
    lower.includes("children") ||
    lower.includes("kids") ||
    lower.includes("little freshman") ||
    lower.includes("freshman") ||
    lower.includes("sophomore") ||
    lower.includes("junior")
  );
}
