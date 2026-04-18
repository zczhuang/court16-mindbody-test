import Link from "next/link";
import Header from "@/components/Header";

export default function Home() {
  return (
    <>
      <Header />
      <div className="c16-container" style={{ paddingBottom: 80 }}>
        <section style={{ padding: "80px 0 40px", textAlign: "center" }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            Court 16 · Tennis Remixed
          </div>
          <h1 className="section-title" style={{ fontSize: "clamp(40px, 7vw, 72px)" }}>
            Book a <em>free</em> kids trial
          </h1>
          <p className="section-sub" style={{ marginTop: 14 }}>
            Six clubs across NY, PA &amp; MA. Pick a club, request a class, and we&apos;ll
            confirm within a few hours. No MindBody setup, no credit card.
          </p>
          <div style={{ marginTop: 28, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/trial" className="btn primary">
              Start your booking
              <svg viewBox="0 0 16 16" width="14" height="14">
                <path
                  d="M2 8h11M9 4l4 4-4 4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <a
              href="https://www.court16.com/adults"
              target="_blank"
              rel="noopener noreferrer"
              className="btn ghost"
            >
              Adult classes
            </a>
          </div>
        </section>

        <section style={{ padding: "40px 0" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 16,
            }}
          >
            <Feature
              icon="🎾"
              title="Real class experience"
              body="Your child joins an actual group class with peers their age — not a staged demo."
            />
            <Feature
              icon="📅"
              title="Pick your time"
              body="Browse available classes by club and age group. No guessing, no back-and-forth."
            />
            <Feature
              icon="⚡"
              title="Confirmed in hours"
              body="Our team matches your child to the perfect class and confirms within a few hours."
            />
          </div>
        </section>
      </div>
    </>
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
          fontWeight: 600,
          fontSize: 18,
          letterSpacing: "-0.01em",
          margin: "0 0 6px",
          color: "var(--c16-black)",
        }}
      >
        {title}
      </h3>
      <p style={{ color: "var(--c16-ink-3)", fontSize: 14, margin: 0, lineHeight: 1.55 }}>
        {body}
      </p>
    </div>
  );
}
