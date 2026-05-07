import { useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TableRow {
  label: string;
  values: (string | boolean)[];
  proIndex: number;
}

interface TableSection {
  category: string;
  rows: TableRow[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const columns = ["Free", "Starter", "Pro", "Agency"];

const tableSections: TableSection[] = [
  {
    category: "Limits",
    rows: [
      { label: "Bots", values: ["1", "3", "10", "Unlimited"], proIndex: 2 },
      {
        label: "Messages / month",
        values: ["100", "2,000", "10,000", "50,000"],
        proIndex: 2,
      },
      {
        label: "File uploads / bot",
        values: ["1", "5", "20", "Unlimited"],
        proIndex: 2,
      },
      { label: "Team members", values: ["1", "1", "3", "10"], proIndex: 2 },
    ],
  },
  {
    category: "Features",
    rows: [
      {
        label: "Lead collection",
        values: [false, true, true, true],
        proIndex: 2,
      },
      {
        label: "Custom Q&A overrides",
        values: [false, true, true, true],
        proIndex: 2,
      },
      {
        label: "Unanswered question gaps",
        values: [false, true, true, true],
        proIndex: 2,
      },
      {
        label: "Chatbot customization",
        values: [true, true, true, true],
        proIndex: 2,
      },
      {
        label: "Training history",
        values: [true, true, true, true],
        proIndex: 2,
      },
    ],
  },
  {
    category: "Analytics",
    rows: [
      {
        label: "Analytics level",
        values: ["Basic", "Basic", "Full", "Full"],
        proIndex: 2,
      },
    ],
  },
  {
    category: "Advanced",
    rows: [
      { label: "API access", values: [false, false, true, true], proIndex: 2 },
      {
        label: "White-label widget",
        values: [false, false, false, true],
        proIndex: 2,
      },
      {
        label: "Team collaboration",
        values: [false, false, true, true],
        proIndex: 2,
      },
    ],
  },
];

// ─── Cell ─────────────────────────────────────────────────────────────────────

function Cell({ value, isPro }: { value: string | boolean; isPro: boolean }) {
  const base = "px-5 py-3.5 text-center align-middle";
  const bg = isPro ? "bg-neutral-950" : "";

  if (typeof value === "boolean") {
    return (
      <td className={`${base} ${bg} text-base`}>
        {value ? (
          <span className={isPro ? "text-white" : "text-neutral-800"}>✓</span>
        ) : (
          <span className="text-neutral-300">✗</span>
        )}
      </td>
    );
  }

  return (
    <td
      className={`${base} ${bg} text-[13px] tracking-tight ${
        isPro ? "text-white font-semibold" : "text-neutral-500"
      }`}
      style={{ fontFamily: "'Geist Mono', monospace" }}
    >
      {value}
    </td>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function PricingSection() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.05 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="pricing" className="max-w-5xl mx-auto px-4 pt-3 pb-24">
      {/* Header */}
      <div className="mb-12">
        <span
          className="inline-block text-[11px] font-semibold tracking-[.14em] uppercase text-neutral-400 border border-neutral-200 px-3 py-1 rounded-sm mb-5"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Pricing
        </span>
        <h2
          className="text-5xl md:text-6xl font-normal leading-none text-neutral-950 mb-4"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          Plans that grow
          <br />
          <em className="italic">with you</em>
        </h2>
        <p
          className="text-[15px] text-neutral-400 max-w-sm leading-relaxed"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Start free, upgrade when your traffic does. No hidden fees, cancel
          anytime.
        </p>
      </div>

      {/* Table */}
      <div
        ref={wrapRef}
        className={`overflow-x-auto border border-neutral-200 rounded-sm transition-all duration-700 ease-out ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
        }`}
      >
        <table className="w-full border-collapse min-w-[580px]">
          {/* Head */}
          <thead>
            <tr className="bg-neutral-950">
              <th
                className="px-5 py-4 text-left text-[11px] font-medium tracking-[.1em] uppercase text-neutral-400 border-b border-neutral-800 w-[32%]"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Feature
              </th>
              {columns.map((col) => {
                const isPro = col === "Pro";
                return (
                  <th
                    key={col}
                    className="px-5 py-4 text-center border-b border-neutral-800"
                  >
                    {isPro ? (
                      <div className="inline-flex flex-col items-center gap-1.5">
                        <span
                          className="text-white text-sm font-semibold"
                          style={{ fontFamily: "'DM Serif Display', serif" }}
                        >
                          {col}
                        </span>
                        <span
                          className="text-[9px] font-semibold tracking-[.1em] uppercase bg-white text-neutral-950 px-2 py-0.5 rounded-sm"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          Popular
                        </span>
                      </div>
                    ) : (
                      <span
                        className="text-neutral-400 text-sm font-medium"
                        style={{ fontFamily: "'DM Serif Display', serif" }}
                      >
                        {col}
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {tableSections.map((section) => (
              <>
                <tr key={section.category} className="bg-neutral-50">
                  <td
                    colSpan={5}
                    className="px-5 py-2.5 text-[11px] font-semibold tracking-[.12em] uppercase text-neutral-400"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {section.category}
                  </td>
                </tr>

                {section.rows.map((row, ri) => (
                  <tr
                    key={row.label}
                    className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors duration-150"
                    style={{
                      opacity: visible ? 1 : 0,
                      transform: visible ? "translateX(0)" : "translateX(-8px)",
                      transitionProperty: "opacity, transform",
                      transitionDuration: "350ms",
                      transitionTimingFunction: "ease-out",
                      transitionDelay: `${ri * 35}ms`,
                    }}
                  >
                    <td
                      className="px-5 py-3.5 text-[13px] font-medium text-neutral-800"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {row.label}
                    </td>
                    {row.values.map((val, ci) => (
                      <Cell key={ci} value={val} isPro={ci === row.proIndex} />
                    ))}
                  </tr>
                ))}
              </>
            ))}
          </tbody>

          {/* Footer CTA row */}
          <tfoot>
            <tr className="bg-neutral-50 border-t border-neutral-200">
              <td
                className="px-5 py-4 text-[13px] text-neutral-400 italic"
                style={{ fontFamily: "'DM Serif Display', serif" }}
              >
                Ready to start?
              </td>
              {columns.map((col) => {
                const isPro = col === "Pro";
                return (
                  <td
                    key={col}
                    className={`px-5 py-4 text-center ${isPro ? "bg-neutral-950" : ""}`}
                  >
                    <a
                      href="/register"
                      className={`inline-block text-[12px] font-semibold tracking-wide px-4 py-2 rounded-sm border transition-all duration-150 ${
                        isPro
                          ? "bg-white text-neutral-950 border-white hover:bg-transparent hover:text-white"
                          : "bg-transparent text-neutral-700 border-neutral-300 hover:border-neutral-950 hover:text-neutral-950"
                      }`}
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {col === "Free" ? "Get started" : `Get ${col}`}
                    </a>
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
