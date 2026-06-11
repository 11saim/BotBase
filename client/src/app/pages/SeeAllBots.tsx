import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MessageSquare, Search } from "lucide-react";

type Bot = {
  id: string;
  name: string;
  emoji: string;
  status: "active" | "pause";
  msgs: number;
  created: string;
  model: string;
  avatarColor: string;
};

const BOTS: Bot[] = [
  {
    id: "bot_2e78626c-47d3",
    name: "Support Bot",
    emoji: "💬",
    status: "active",
    msgs: 0,
    created: "Apr 12, 2025",
    model: "gpt-4o",
    avatarColor: "bg-emerald-100",
  },
  {
    id: "bot_d0d32075-34b1",
    name: "bot",
    emoji: "💼",
    status: "active",
    msgs: 0,
    created: "Apr 18, 2025",
    model: "gpt-4o-mini",
    avatarColor: "bg-amber-100",
  },
  {
    id: "bot_a1f39c82-11c0",
    name: "Sales Assistant",
    emoji: "🛒",
    status: "active",
    msgs: 142,
    created: "Mar 5, 2025",
    model: "claude-3-haiku",
    avatarColor: "bg-violet-100",
  },
  {
    id: "bot_b7d20e51-9fa2",
    name: "HR Helper",
    emoji: "👥",
    status: "pause",
    msgs: 38,
    created: "Feb 20, 2025",
    model: "gpt-4o",
    avatarColor: "bg-orange-100",
  },
  {
    id: "bot_c3e8a174-5bc9",
    name: "Docs Bot",
    emoji: "📄",
    status: "active",
    msgs: 77,
    created: "Mar 29, 2025",
    model: "gpt-4o-mini",
    avatarColor: "bg-sky-100",
  },
];

export default function SeeAllBots() {
  const [query, setQuery] = useState("");

  const filteredBots = useMemo(() => {
    const q = query.toLowerCase();

    return BOTS.filter(
      (bot) =>
        bot.name.toLowerCase().includes(q) || bot.id.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-none">
      <div className="mb-7 flex items-baseline gap-2">
        <h1 className="text-2xl font-medium text-zinc-900">Bots</h1>

        <span className="text-sm text-zinc-500">/ Your workspace</span>
      </div>

      <div className="relative mb-7">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

        <input
          type="text"
          placeholder="Search bots by name or ID..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-4 focus:ring-zinc-200/40"
        />
      </div>

      {filteredBots.length === 0 ? (
        <div className="py-16 text-center text-sm text-zinc-500">
          <div className="mb-2 text-3xl">🤖</div>
          No bots match your search
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredBots.map((bot) => (
            <div
              key={bot.id}
              className="group rounded-2xl border border-zinc-200 bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:border-zinc-300"
            >
              <div className="mb-4 flex items-start gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${bot.avatarColor}`}
                >
                  {bot.emoji}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-medium text-zinc-900">
                    {bot.name}
                  </h3>

                  <p className="mt-1 truncate font-mono text-[11px] text-zinc-500">
                    {bot.id}
                  </p>
                </div>

                <StatusBadge status={bot.status} />
              </div>

              <div className="mb-4 flex items-center gap-2 text-sm text-zinc-600">
                <MessageSquare className="h-4 w-4 text-zinc-400" />

                <span>
                  Messages this week:
                  <strong className="ml-1 font-medium text-zinc-900">
                    {bot.msgs}
                  </strong>
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-zinc-200 pt-4">
                <span className="text-xs text-zinc-500">
                  Created {bot.created}
                </span>

                <Link
                  to={`/dashboard/bots/${bot.id}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100"
                >
                  Open
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: "active" | "pause" }) {
  const isActive = status === "active";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${isActive ? "bg-lime-100 text-lime-700" : "bg-stone-200 text-stone-700"
        }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {isActive ? "Active" : "pause"}
    </span>
  );
}


