import Link from "next/link";
import Header from "@/components/Header";

export default function Home() {
  return (
    <>
      <Header />
      <div className="c16-container" style={{ paddingBottom: 80 }}>
        <section style={{ padding: "80px 0 32px", textAlign: "center" }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            Court 16 · Tennis Remixed
          </div>
          <h1 className="section-title" style={{ fontSize: "clamp(40px, 7vw, 72px)" }}>
            Book a Court 16 <em>trial</em>
          </h1>
          <p className="section-sub" style={{ marginTop: 14 }}>
            Six clubs across NY, PA &amp; MA. Pick the path that fits — kids trial is
            free and staff-confirmed; adult intros are one-session drop-ins for $58–$75.
          </p>
        </section>

        <section style={{ padding: "12px 0 56px" }}>
          <div
            style={{
              display: "grid",
              gap: 18,
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            }}
          >
            <PathCard
              eyebrow="For your child"
              title="Kids free trial"
              description="Ages 3–17. Browse real classes, pick a time, and staff confirms within a few hours."
              cta="Start kids trial"
              href="/trial"
              accent
            />
            <PathCard
              eyebrow="For you"
              title="Adult intro"
              description="Tennis Intro Special ($75) or Pickleball Clinic Intro ($58). Book a session and pay online in a few clicks."
              cta="Start adult intro"
              href="/intro"
            />
          </div>
        </section>

        <section>
          <h2
            style={{
              fontFamily: "var(--f-display)",
              fontWeight: 700,
              fontSize: "clamp(22px, 3vw, 28px)",
              letterSpacing: "-0.025em",
              textAlign: "center",
              margin: "0 0 24px",
            }}
          >
            How booking works
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 16,
            }}
          >
            <Feature
              icon="🎾"
              title="Real classes, real coaches"
              body="You (or your kid) join an actual class — not a sales demo."
            />
            <Feature
              icon="📅"
              title="Pick your time"
              body="Browse live calendars per club with open spots counted upfront."
            />
            <Feature
              icon="⚡"
              title="Confirmed fast"
              body="Kids trials: staff confirms within hours. Adult intros: instant after payment."
            />
          </div>
        </section>
      </div>
    </>
  );
}

function PathCard({
  eyebrow,
  title,
  description,
  cta,
  href,
  accent,
}: {
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  href: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: "26px 26px 22px",
        background: "#fff",
        border: accent ? "2px solid var(--c16-black)" : "1.5px solid var(--c16-line)",
        borderRadius: "var(--r-xl)",
        color: "var(--c16-black)",
        boxShadow: accent ? "4px 4px 0 var(--c16-yellow)" : "none",
        transition: "transform .15s ease, box-shadow .15s ease, border-color .15s ease",
        minHeight: 200,
      }}
    >
      <span className="eyebrow">{eyebrow}</span>
      <div
        style={{
          fontFamily: "var(--f-display)",
          fontWeight: 800,
          fontSize: 28,
          letterSpacing: "-0.03em",
          lineHeight: 1.05,
        }}
      >
        {title}
      </div>
      <p style={{ color: "var(--c16-ink-3)", margin: 0, fontSize: 14, lineHeight: 1.55 }}>
        {description}
      </p>
      <span
        style={{
          marginTop: "auto",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 13,
          fontWeight: 700,
          color: "var(--c16-black)",
        }}
      >
        {cta}
        <svg viewBox="0 0 16 16" width="14" height="14">
          <path
            d="M2 8h11M9 4l4 4-4 4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </Link>
  );
}

function Feature({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1.5px solid var(--c16-line)",
        borderRadius: "var(--r-xl)",
        padding: "22px 22px 20px",
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 10 }}>{icon}</div>
      <h3
        style={{
          fontFamily: "var(--f-display)",
          fontWeight: 700,
          fontSize: 18,
          letterSpacing: "-0.02em",
          margin: "0 0 6px",
          color: "var(--c16-black)",
        }}
      >
        {title}
      </h3>
      <p style={{ color: "var(--c16-ink-3)", fontSize: 14, margin: 0, lineHeight: 1.55 }}>{body}</p>
    </div>
  );
}
