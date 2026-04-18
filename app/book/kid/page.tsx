"use client";

import { useState } from "react";

interface TrialResult {
  ok: boolean;
  correlationId: string;
  status?: string;
  parentId?: string | number | null;
  childId?: string | number | null;
  trace?: Array<{ step: string; status: string }>;
  error?: unknown;
  errors?: string[];
}

// Must match lib/config.ts (and, in turn, the HubSpot form options).
const LOCATIONS = [
  { slug: "long-island-city", label: "Long Island City, Queens" },
  { slug: "downtown-brooklyn", label: "Downtown Brooklyn" },
  { slug: "manhattan-fidi", label: "FiDi — Manhattan" },
  { slug: "fishtown-philly", label: "Fishtown — Philadelphia" },
  { slug: "ridge-hill-yonkers", label: "Ridge Hill — Yonkers" },
  { slug: "newton-ma", label: "Newton — Massachusetts" },
];

const AGE_BANDS = [
  { value: "2.5 - 3 yo", label: "2.5 – 3" },
  { value: "3 - 4 yo", label: "4" },
  { value: "5 - 6 yo", label: "5 – 6" },
  { value: "7 - 8 yo", label: "7 – 8" },
  { value: "9 - 11 yo", label: "9 – 11" },
  { value: "12 yo or older", label: "12 – 15" },
  { value: "15 and older", label: "15 and older" },
];

const PLAYING_LEVELS = [
  { value: "New to Tennis", label: "New to tennis" },
  { value: "Played a bit here and there", label: "Played a bit here and there" },
  { value: "Has taken formal lessons", label: "Has taken formal lessons" },
];

const LEAD_SOURCES = [
  "Word of Mouth",
  "Flyer",
  "Friend with a Court 16 member",
  "Google",
  "Facebook",
  "Instagram",
  "Other",
  "Events",
];

type Step = "location" | "parent" | "child" | "extras" | "waiver" | "submitting" | "done";

export default function KidBooking() {
  const [step, setStep] = useState<Step>("location");
  const [location, setLocation] = useState("");
  const [parent, setParent] = useState({ firstName: "", lastName: "", email: "", mobilePhone: "", birthDate: "" });
  const [child, setChild] = useState({
    firstName: "",
    lastName: "",
    ageBand: "",
    birthDate: "",
    playingLevel: "",
    school: "",
  });
  const [leadSource, setLeadSource] = useState("");
  const [referrerEmail, setReferrerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [waiver, setWaiver] = useState(false);
  const [result, setResult] = useState<TrialResult | null>(null);

  async function submit() {
    setStep("submitting");
    const body = {
      location,
      parent,
      child,
      leadSource,
      referrerEmail: referrerEmail || undefined,
      notes: notes || undefined,
      waiverVersion: "v1.0",
    };
    try {
      const res = await fetch("/api/book/trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as TrialResult;
      setResult(json);
      setStep("done");
    } catch (err) {
      setResult({ ok: false, correlationId: "client-error", error: err instanceof Error ? err.message : String(err) });
      setStep("done");
    }
  }

  return (
    <main style={wrap}>
      <div style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "#888" }}>Court 16 · Kids trial</div>
      <h1 style={{ fontSize: 24, margin: "4px 0 24px" }}>Book a free trial</h1>

      {step === "location" && (
        <section>
          <Label>Which location?</Label>
          <div style={{ display: "grid", gap: 8 }}>
            {LOCATIONS.map((l) => (
              <button key={l.slug} onClick={() => { setLocation(l.slug); setStep("parent"); }} style={choiceBtn}>
                {l.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {step === "parent" && (
        <section style={section}>
          <Row>
            <Field label="Parent first name"><input required value={parent.firstName} onChange={(e) => setParent({ ...parent, firstName: e.target.value })} style={input} /></Field>
            <Field label="Parent last name"><input required value={parent.lastName} onChange={(e) => setParent({ ...parent, lastName: e.target.value })} style={input} /></Field>
          </Row>
          <Row>
            <Field label="Email"><input required type="email" value={parent.email} onChange={(e) => setParent({ ...parent, email: e.target.value })} style={input} /></Field>
            <Field label="Mobile phone"><input value={parent.mobilePhone} onChange={(e) => setParent({ ...parent, mobilePhone: e.target.value })} style={input} /></Field>
          </Row>
          <Field label="Parent DOB (YYYY-MM-DD)"><input required placeholder="1985-01-01" value={parent.birthDate} onChange={(e) => setParent({ ...parent, birthDate: e.target.value })} style={input} /></Field>
          <button
            onClick={() => setStep("child")}
            disabled={!parent.firstName || !parent.lastName || !parent.email || !parent.birthDate}
            style={parent.firstName && parent.lastName && parent.email && parent.birthDate ? nextBtn : disabledBtn}
          >
            Next
          </button>
        </section>
      )}

      {step === "child" && (
        <section style={section}>
          <Row>
            <Field label="Child first name"><input required value={child.firstName} onChange={(e) => setChild({ ...child, firstName: e.target.value })} style={input} /></Field>
            <Field label="Child last name"><input required value={child.lastName} onChange={(e) => setChild({ ...child, lastName: e.target.value })} style={input} /></Field>
          </Row>
          <Row>
            <Field label="Child age">
              <select required value={child.ageBand} onChange={(e) => setChild({ ...child, ageBand: e.target.value })} style={input}>
                <option value="" disabled>Please select</option>
                {AGE_BANDS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </Field>
            <Field label="Child DOB (YYYY-MM-DD)"><input required placeholder="2018-06-15" value={child.birthDate} onChange={(e) => setChild({ ...child, birthDate: e.target.value })} style={input} /></Field>
          </Row>
          <Field label="Previous playing experience">
            <select required value={child.playingLevel} onChange={(e) => setChild({ ...child, playingLevel: e.target.value })} style={input}>
              <option value="" disabled>Please select</option>
              {PLAYING_LEVELS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </Field>
          <Field label="School"><input required value={child.school} onChange={(e) => setChild({ ...child, school: e.target.value })} style={input} /></Field>
          <button
            onClick={() => setStep("extras")}
            disabled={!child.firstName || !child.lastName || !child.ageBand || !child.birthDate || !child.playingLevel || !child.school}
            style={
              child.firstName && child.lastName && child.ageBand && child.birthDate && child.playingLevel && child.school
                ? nextBtn
                : disabledBtn
            }
          >
            Next
          </button>
        </section>
      )}

      {step === "extras" && (
        <section style={section}>
          <Field label="How did you hear about us?">
            <select required value={leadSource} onChange={(e) => setLeadSource(e.target.value)} style={input}>
              <option value="" disabled>Please select</option>
              {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          {leadSource === "Friend with a Court 16 member" && (
            <Field label="Friend's email (so we can thank them)">
              <input type="email" value={referrerEmail} onChange={(e) => setReferrerEmail(e.target.value)} style={input} />
            </Field>
          )}
          <Field label="Anything else we should know? (optional)">
            <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} style={{ ...input, fontFamily: "inherit" }} />
          </Field>
          <button onClick={() => setStep("waiver")} disabled={!leadSource} style={leadSource ? nextBtn : disabledBtn}>
            Next
          </button>
        </section>
      )}

      {step === "waiver" && (
        <section style={section}>
          <Label>Waiver</Label>
          <div style={{ fontSize: 13, color: "#555", border: "1px solid #eee", padding: 12, borderRadius: 8 }}>
            I acknowledge Court 16&apos;s participation waiver and agree to its terms. Full text available on request.
          </div>
          <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12 }}>
            <input type="checkbox" checked={waiver} onChange={(e) => setWaiver(e.target.checked)} />
            I agree (waiver v1.0)
          </label>
          <button disabled={!waiver} onClick={submit} style={waiver ? nextBtn : disabledBtn}>Submit trial request</button>
        </section>
      )}

      {step === "submitting" && <section style={section}><div style={{ color: "#888" }}>Submitting…</div></section>}

      {step === "done" && result && (
        <section style={section}>
          {result.ok ? (
            result.status === "duplicate_email_softwall" ? (
              <div>
                <h2 style={{ fontSize: 20 }}>We see you in our system</h2>
                <p style={{ color: "#555" }}>
                  It looks like you&apos;ve been with Court 16 before. Someone on our team will reach out within 24 hours to add this trial for {child.firstName}.
                </p>
                <p style={{ fontSize: 12, color: "#888" }}>Reference: {result.correlationId}</p>
              </div>
            ) : (
              <div>
                <h2 style={{ fontSize: 20 }}>We&apos;re confirming your trial</h2>
                <p style={{ color: "#555" }}>You&apos;ll hear from Court 16 within a few hours with your confirmed class details.</p>
                <p style={{ fontSize: 12, color: "#888" }}>Reference: {result.correlationId}</p>
              </div>
            )
          ) : (
            <div>
              <h2 style={{ fontSize: 20, color: "#a52834" }}>Something went wrong</h2>
              <p style={{ color: "#555" }}>Please email <a href="mailto:info@court16.com">info@court16.com</a> with this reference: <code>{result.correlationId}</code></p>
              <pre style={{ background: "#111", color: "#eee", padding: 12, borderRadius: 8, overflow: "auto", fontSize: 11 }}>
{JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 12, color: "#555", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>{children}</div>;
}
function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>{children}</div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label style={{ display: "grid", gap: 4, fontSize: 12, color: "#555" }}>{label}{children}</label>;
}

const wrap: React.CSSProperties = {
  maxWidth: 640,
  margin: "0 auto",
  padding: "48px 24px",
  fontFamily: "system-ui, -apple-system, sans-serif",
};
const section: React.CSSProperties = { display: "grid", gap: 12 };
const input: React.CSSProperties = {
  padding: "10px 12px",
  fontSize: 14,
  border: "1px solid #ddd",
  borderRadius: 8,
  width: "100%",
  boxSizing: "border-box",
};
const choiceBtn: React.CSSProperties = {
  padding: "14px 18px",
  fontSize: 15,
  background: "#fff",
  border: "1px solid #e5e5e5",
  borderRadius: 8,
  textAlign: "left",
  cursor: "pointer",
};
const nextBtn: React.CSSProperties = {
  padding: "12px 20px",
  fontSize: 14,
  fontWeight: 600,
  background: "#111",
  color: "#fff",
  border: 0,
  borderRadius: 8,
  cursor: "pointer",
  marginTop: 8,
};
const disabledBtn: React.CSSProperties = { ...nextBtn, background: "#ccc", cursor: "not-allowed" };
