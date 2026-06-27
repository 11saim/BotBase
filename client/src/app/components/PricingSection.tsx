import { useEffect, useRef, useState, Fragment } from "react";
import { toast } from "sonner";

interface TableRow {
  label: string;
  values: (string | boolean)[];
  proIndex: number;
}

interface TableSection {
  category: string;
  rows: TableRow[];
}

type Variant = "home" | "plan&usage";

interface PricingSectionProps {
  variant?: Variant;
  currentPlan?: "Free" | "Starter" | "Pro" | "Agency";
}

const columns = ["Free", "Starter", "Pro", "Agency"];

const tableSections: TableSection[] = [
  {
    category: "Limits",
    rows: [
      { label: "Bots", values: ["1", "3", "10", "15"], proIndex: 2 },
      {
        label: "Messages / month",
        values: ["100", "2,000", "10,000", "50,000"],
        proIndex: 2,
      },
      {
        label: "Source uploads",
        values: ["1", "5", "15", "30"],
        proIndex: 2,
      },
    ],
  },
  {
    category: "Features",
    rows: [
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
    category: "Prices",
    rows: [
      {
        label: "Prices",
        values: ["Free", "$15/mo", "$30/mo", "$150/mo"],
        proIndex: 2,
      },
    ],
  },
];

function Cell({ value, isPro }: { value: string | boolean; isPro: boolean }) {
  const base = "px-5 py-3.5 text-center align-middle";

  if (typeof value === "boolean") {
    return (
      <td className={`${base} ${isPro ? "bg-neutral-950" : ""}`}>
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
      className={`${base} ${isPro ? "bg-neutral-950 text-white font-semibold" : "text-neutral-500"}`}
    >
      {value}
    </td>
  );
}

const PRICE_IDS = {
  Starter: "price_1TmXjfDJ6uKm9It9H5RFsUWs",
  Pro: "price_1TmXkbDJ6uKm9It9eAkgt0lc",
  Agency: "price_1TmXlBDJ6uKm9It96ta0OiNg",
};

export default function PricingSection({
  variant = "home",
  currentPlan = "Free",
}: PricingSectionProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  const hideHeading = variant !== "home";

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

  const handleCheckout = async (plan: string) => {
    if (plan === "Free") return;

    try {
      const priceId = PRICE_IDS[plan as keyof typeof PRICE_IDS];

      const res = await fetch(
        `http://localhost:5000/api/stripe/checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ priceId, plan }),
          credentials: "include",
        })

      const data = await res.json();

      window.location.href = data.url;
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to start checkout."
      );
    }
  };

  return (
    <section id="pricing" className="max-w-5xl mx-auto px-4 pt-2">
      {/* HEADER (only home) */}
      {!hideHeading && (
        <div className="mt-2 mb-12 flex flex-col items-center justify-center">
          <span className="inline-block px-6 py-2 rounded-full bg-green-100 text-green-700 text-sm font-semibold mb-4">
            Pricing
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-center">
            Plans that grow with you
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl text-center">
            Start free, upgrade when your traffic does. No hidden fees, cancel
            anytime.
          </p>
        </div>
      )}

      {/* TABLE */}
      <div
        ref={wrapRef}
        className={`overflow-x-auto border border-neutral-200 rounded-sm transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          }`}
      >
        <table className="w-full border-collapse min-w-[580px]">
          {/* HEADER */}
          <thead>
            <tr className="bg-neutral-950">
              <th className="px-5 py-4 text-left text-[11px] uppercase tracking-widest text-neutral-400 w-[32%]">
                Feature
              </th>

              {columns.map((col) => {
                const isCurrent = col === currentPlan;

                return (
                  <th key={col} className="px-5 py-4 text-center">
                    <div className="flex flex-col items-center gap-1.5">
                      <span
                        className={`text-sm font-semibold ${isCurrent ? "text-white" : "text-neutral-400"
                          }`}
                      >
                        {col}
                      </span>

                      {/* Current plan badge */}
                      {variant !== "home" && isCurrent && (
                        <span className="text-[9px] px-2 py-0.5 rounded-sm bg-emerald-500 text-white uppercase tracking-widest">
                          Current Plan
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {tableSections.map((section) => (
              <Fragment key={section.category}>
                <tr className="bg-neutral-50">
                  <td
                    colSpan={5}
                    className="px-5 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-neutral-400"
                  >
                    {section.category}
                  </td>
                </tr>

                {section.rows.map((row, ri) => (
                  <tr
                    key={row.label}
                    className="border-b border-neutral-100 hover:bg-neutral-50 transition"
                    style={{
                      opacity: visible ? 1 : 0,
                      transform: visible ? "translateX(0)" : "translateX(-8px)",
                      transition: "all 350ms ease-out",
                      transitionDelay: `${ri * 35}ms`,
                    }}
                  >
                    <td className="px-5 py-3.5 text-[13px] font-medium text-neutral-800">
                      {row.label}
                    </td>

                    {row.values.map((val, ci) => {
                      const isCurrent = columns[ci] === currentPlan;

                      return (
                        <Cell
                          key={ci}
                          value={val}
                          isPro={ci === row.proIndex}
                        />
                      );
                    })}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>

          {/* FOOTER */}
          <tfoot>
            <tr className="bg-neutral-50 border-t border-neutral-200">
              <td className="whitespace-nowrap px-5 py-4 text-[13px] text-neutral-400">
                Ready to start?
              </td>

              {columns.map((col) => {
                const isCurrent = col === currentPlan;
                const colIndex = columns.indexOf(col);
                const currentIndex = columns.indexOf(currentPlan);
                const isBelowOrCurrent = colIndex <= currentIndex;
                const disable = variant !== "home" && isBelowOrCurrent;

                return (
                  <td key={col} className="px-5 py-4 text-center">
                    <button
                      disabled={disable}
                      onClick={() => handleCheckout(col)}
                      className={`whitespace-nowrap w-full sm:w-auto text-[12px] font-semibold px-4 py-2 rounded-sm border transition ${disable
                        ? "bg-neutral-200 text-neutral-400 border-neutral-200 cursor-not-allowed"
                        : "bg-transparent text-neutral-700 border-neutral-300 hover:border-neutral-950 hover:text-neutral-950"
                        }`}
                    >
                      {variant !== "home" && isCurrent
                        ? "Current Plan"
                        : `Get ${col}`}
                    </button>
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
