import { NextResponse } from "next/server";
import {
  addClient,
  addClientRelationship,
  checkCallerToken,
  getClientsByEmail,
  GUARDIAN_RELATIONSHIP,
  loadConfigFromEnv,
  MindbodyError,
} from "@/lib/mindbody";
import {
  HubspotError,
  loadHubspotConfig,
  submitTrialForm,
} from "@/lib/hubspot";
import { buildStaffUrl } from "@/lib/staff-tokens";
import { classifyIntent } from "@/lib/intent";
import { createLogger, makeCorrelationId } from "@/lib/logger";
import {
  CHILD_AGE_BAND_VALUES,
  getLocation,
  LEAD_SOURCES,
  PLAYING_LEVEL_VALUES,
  WAIVER_VERSION,
  type ChildAgeBand,
  type LeadSource,
  type PlayingLevel,
} from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface TrialBody {
  location: string; // app slug
  parent: {
    firstName: string;
    lastName: string;
    email: string;
    mobilePhone?: string;
    birthDate: string;
  };
  child: {
    firstName: string;
    lastName: string;
    ageBand: ChildAgeBand;
    birthDate: string; // ISO "YYYY-MM-DD"
    playingLevel: PlayingLevel;
    school: string;
  };
  leadSource: LeadSource;
  referrerEmail?: string;
  notes?: string;
  classId?: number; // optional — if known at submit time
  waiverVersion: string;
}

export async function POST(req: Request) {
  const correlationId = makeCorrelationId();
  const log = createLogger(correlationId);

  const auth = checkCallerToken(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, correlationId, error: auth.reason }, { status: auth.status });
  }

  let body: TrialBody;
  try {
    body = (await req.json()) as TrialBody;
  } catch {
    return NextResponse.json({ ok: false, correlationId, error: "Invalid JSON body" }, { status: 400 });
  }

  const errors = validate(body);
  if (errors.length > 0) {
    return NextResponse.json({ ok: false, correlationId, errors }, { status: 400 });
  }

  const location = getLocation(body.location);
  if (!location) {
    return NextResponse.json(
      { ok: false, correlationId, error: `unknown location: ${body.location}` },
      { status: 400 },
    );
  }

  let mbCfg;
  try {
    mbCfg = { ...loadConfigFromEnv(), siteId: location.mindbodySiteId };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, correlationId, error: msg }, { status: 500 });
  }
  const hsCfg = loadHubspotConfig();
  const baseUrl = process.env.APP_BASE_URL ?? `http://localhost:3000`;

  log.info("trial.start", {
    writeMode: mbCfg.writeMode,
    parentEmail: body.parent.email,
    childName: body.child.firstName,
    location: location.slug,
    classId: body.classId ?? null,
  });

  const trace: Array<{ step: string; status: "ok" | "skipped" | "error"; data?: unknown; error?: unknown }> = [];

  try {
    // 1. Identity resolution — MindBody first.
    const existing = await getClientsByEmail(mbCfg, log, body.parent.email);
    trace.push({ step: "getClientsByEmail", status: "ok", data: { matched: existing.length } });

    const intent = classifyIntent({
      bookingFor: "kid",
      mindbodyClientExists: existing.length > 0,
    });

    if (intent === "existing_user_softwall") {
      await submitFormSafely(hsCfg, log, buildFormFields({
        correlationId,
        body,
        location,
        status: "duplicate_email_softwall",
        parentMbId: existing[0]?.Id != null ? String(existing[0].Id) : undefined,
        childMbId: undefined,
        baseUrl,
      }), trace, "hubspot.submitTrialForm (softwall)");
      return NextResponse.json({
        ok: true,
        correlationId,
        status: "duplicate_email_softwall",
        trace,
      });
    }

    // 2. Create parent in MindBody.
    const parent = await addClient(mbCfg, log, {
      FirstName: body.parent.firstName,
      LastName: body.parent.lastName,
      Email: body.parent.email,
      MobilePhone: body.parent.mobilePhone,
      BirthDate: body.parent.birthDate,
    });
    trace.push({ step: "addClient (parent)", status: "ok", data: { id: parent.Id } });

    // 3. Create child. Synthetic email because MindBody requires unique
    // emails; kids don't have their own.
    const childEmail = `kid+${correlationId}@court16-test.invalid`;
    const child = await addClient(mbCfg, log, {
      FirstName: body.child.firstName,
      LastName: body.child.lastName,
      Email: childEmail,
      BirthDate: body.child.birthDate,
    });
    trace.push({ step: "addClient (child)", status: "ok", data: { id: child.Id } });

    // 4. Link parent → child (Guardian). In Test mode Id is null, skip.
    let relationshipStatus: "ok" | "skipped" | "error" = "skipped";
    let relationshipError: unknown = undefined;
    if (parent.Id && child.Id) {
      try {
        await addClientRelationship(mbCfg, log, {
          ClientId: parent.Id,
          RelatedClientId: child.Id,
          RelationshipId: GUARDIAN_RELATIONSHIP.Id,
        });
        relationshipStatus = "ok";
      } catch (e) {
        relationshipStatus = "error";
        relationshipError = serialize(e);
      }
    }
    trace.push({
      step: "addClientRelationship",
      status: relationshipStatus,
      error: relationshipError,
    });

    // 5. Submit to HubSpot's existing trial form.
    await submitFormSafely(hsCfg, log, buildFormFields({
      correlationId,
      body,
      location,
      status: "pending_staff",
      parentMbId: parent.Id ? String(parent.Id) : undefined,
      childMbId: child.Id ? String(child.Id) : undefined,
      baseUrl,
    }), trace, "hubspot.submitTrialForm");

    log.info("trial.done", { trace: trace.map((t) => ({ step: t.step, status: t.status })) });

    return NextResponse.json({
      ok: true,
      correlationId,
      writeMode: mbCfg.writeMode,
      status: "pending_staff",
      parentId: parent.Id ?? null,
      childId: child.Id ?? null,
      trace,
    });
  } catch (e) {
    log.error("trial.fail", { error: serialize(e) });
    return NextResponse.json(
      { ok: false, correlationId, trace, error: serialize(e) },
      { status: e instanceof MindbodyError ? 502 : 500 },
    );
  }
}

interface BuildFieldsArgs {
  correlationId: string;
  body: TrialBody;
  location: NonNullable<ReturnType<typeof getLocation>>;
  status: "pending_staff" | "duplicate_email_softwall" | "pending_payment";
  parentMbId?: string;
  childMbId?: string;
  baseUrl: string;
}
function buildFormFields(args: BuildFieldsArgs) {
  const { correlationId, body, location, status, parentMbId, childMbId, baseUrl } = args;
  const [yyyy, mm, dd] = body.child.birthDate.split("-");

  return {
    firstname: body.parent.firstName,
    lastname: body.parent.lastName,
    email: body.parent.email,
    phone: body.parent.mobilePhone,

    preferred_location: location.hubspotValue,
    child_name: body.child.firstName,
    child_1___last_name: body.child.lastName,
    childage: body.child.ageBand,
    child_date_of_birth__YYYY: yyyy,
    child_date_of_birth__MM: mm,
    child_date_of_birth__DD: dd,
    child_1___playing_level: body.child.playingLevel,
    school: body.child.school,
    lead_source: body.leadSource,
    referrer: body.referrerEmail,
    any_question_just_let_us_know: body.notes,

    court16_correlation_id: correlationId,
    court16_intent: "kid_trial" as const,
    court16_booking_status: status,
    court16_class_id: body.classId != null ? String(body.classId) : undefined,
    court16_location_slug: location.slug,
    court16_waiver_version: body.waiverVersion,
    court16_mindbody_parent_id: parentMbId,
    court16_mindbody_child_id: childMbId,
    court16_staff_confirm_url: buildStaffUrl({ action: "confirm", correlationId, baseUrl }),
    court16_staff_reassign_url: buildStaffUrl({ action: "reassign", correlationId, baseUrl }),
    court16_admin_retry_url: buildStaffUrl({ action: "retry", correlationId, baseUrl }),
  };
}

async function submitFormSafely(
  hsCfg: ReturnType<typeof loadHubspotConfig>,
  log: ReturnType<typeof createLogger>,
  fields: ReturnType<typeof buildFormFields>,
  trace: Array<{ step: string; status: "ok" | "skipped" | "error"; data?: unknown; error?: unknown }>,
  label: string,
): Promise<void> {
  if (!hsCfg) {
    log.info("trial.hubspot.skipped", { reason: "HubSpot not configured" });
    trace.push({ step: label, status: "skipped", data: { reason: "HubSpot not configured" } });
    return;
  }
  try {
    await submitTrialForm(hsCfg, log, fields);
    trace.push({ step: label, status: "ok" });
  } catch (e) {
    log.warn("trial.hubspot.fail", { error: serialize(e) });
    trace.push({ step: label, status: "error", error: serialize(e) });
  }
}

function validate(body: TrialBody | undefined): string[] {
  if (!body) return ["Body is required"];
  const errors: string[] = [];
  if (!body.location) errors.push("location is required");
  if (!body.parent) errors.push("parent is required");
  if (!body.child) errors.push("child is required");
  if (body.parent) {
    if (!body.parent.firstName) errors.push("parent.firstName is required");
    if (!body.parent.lastName) errors.push("parent.lastName is required");
    if (!/^\S+@\S+\.\S+$/.test(body.parent.email ?? "")) errors.push("parent.email is invalid");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(body.parent.birthDate ?? ""))
      errors.push('parent.birthDate must be "YYYY-MM-DD"');
  }
  if (body.child) {
    if (!body.child.firstName) errors.push("child.firstName is required");
    if (!body.child.lastName) errors.push("child.lastName is required");
    if (!CHILD_AGE_BAND_VALUES.includes(body.child.ageBand))
      errors.push(`child.ageBand must be one of: ${CHILD_AGE_BAND_VALUES.join(" | ")}`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(body.child.birthDate ?? ""))
      errors.push('child.birthDate must be "YYYY-MM-DD"');
    if (!PLAYING_LEVEL_VALUES.includes(body.child.playingLevel))
      errors.push(`child.playingLevel must be one of: ${PLAYING_LEVEL_VALUES.join(" | ")}`);
    if (!body.child.school || body.child.school.trim().length < 2)
      errors.push("child.school is required");
  }
  if (!LEAD_SOURCES.includes(body.leadSource))
    errors.push(`leadSource must be one of: ${LEAD_SOURCES.join(" | ")}`);
  if (body.waiverVersion !== WAIVER_VERSION)
    errors.push(`waiverVersion must equal current version "${WAIVER_VERSION}"`);
  return errors;
}

function serialize(e: unknown): unknown {
  if (e instanceof MindbodyError) return e.toJSON();
  if (e instanceof HubspotError) return e.toJSON();
  if (e instanceof Error) return { name: e.name, message: e.message };
  return e;
}
