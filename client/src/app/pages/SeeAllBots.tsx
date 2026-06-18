import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MessageSquare, Search } from "lucide-react";

const API = "http://localhost:5000/api";

type Bot = {
  _id: string;
  name: string;
  description: string;
  botAvatar: string;
  status: "active" | "paused" | "locked" | "deleted";
  conversationCount: number;
  createdAt: string;
};

const AVATAR_COLORS = [
  "bg-emerald-100", "bg-amber-100", "bg-violet-100",
  "bg-orange-100", "bg-sky-100", "bg-rose-100",
];

const getAvatarColor = (name: string) =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default function SeeAllBots() {
  const [query, setQuery] = useState("");
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBots = async () => {
      try {
        const res = await fetch(`${API}/bots`, { credentials: "include" });
        const data = await res.json();
        setBots(data.bots || []);
      } catch (err) {
        console.error("Bots fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBots();
  }, []);

  const filteredBots = useMemo(() => {
    const q = query.toLowerCase();
    return bots.filter(b =>
      b.name.toLowerCase().includes(q) || b._id.toLowerCase().includes(q)
    );
  }, [query, bots]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <p className="text-[13px] text-[var(--text-tertiary)]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-none">
      <div className="mb-7 flex items-baseline gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
          Your All Bots
        </h1>
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

      {bots.length === 0 ? (
        <div className="py-16 text-center text-sm text-zinc-500">
          <div className="mb-2 text-3xl">🤖</div>
          <p>You haven't created any bots yet</p>
          <Link
            to="/dashboard/bots/new"
            className="mt-4 inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100 transition"
          >
            Create your first bot <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : filteredBots.length === 0 ? (
        <div className="py-16 text-center text-sm text-zinc-500">
          <div className="mb-2 text-3xl">🔍</div>
          No bots match your search
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredBots.map((bot) => (
            <div
              key={bot._id}
              className="group rounded-2xl border border-zinc-200 bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:border-zinc-300"
            >
              <div className="mb-4 flex items-start gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${getAvatarColor(bot.name)}`}>
                  {bot.botAvatar.startsWith("http")
                    ? <img src={bot.botAvatar} className="h-8 w-8 rounded-lg object-cover" />
                    : bot.botAvatar
                  }
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-medium text-zinc-900">{bot.name}</h3>
                  <p className="mt-1 truncate font-mono text-[11px] text-zinc-500">{bot._id}</p>
                </div>
                <StatusBadge status={bot.status} />
              </div>

              <div className="mb-4 flex items-center gap-2 text-sm text-zinc-600">
                <MessageSquare className="h-4 w-4 text-zinc-400" />
                <span>
                  Conversations: <strong className="ml-1 font-medium text-zinc-900">{bot.conversationCount}</strong>
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-zinc-200 pt-4">
                <span className="text-xs text-zinc-500">Created {formatDate(bot.createdAt)}</span>
                <Link
                  to={`/dashboard/bots/${bot._id}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100"
                >
                  Open <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: Bot["status"] }) {
  const styles: Record<Bot["status"], { bg: string; label: string }> = {
    active: { bg: "bg-lime-100 text-lime-700", label: "Active" },
    paused: { bg: "bg-stone-200 text-stone-700", label: "Paused" },
    locked: { bg: "bg-red-100 text-red-700", label: "Locked" },
    deleted: { bg: "bg-zinc-100 text-zinc-400", label: "Deleted" },
  };

  const { bg, label } = styles[status] || styles.active;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${bg}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {label}
    </span>
  );
}