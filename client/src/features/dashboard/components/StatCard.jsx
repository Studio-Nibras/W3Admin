import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

const trendConfig = {
  up: {
    icon: ArrowUpRight,
    color: "text-emerald-700",
    background: "bg-emerald-100/80",
  },
  down: {
    icon: ArrowDownRight,
    color: "text-rose-700",
    background: "bg-rose-100/80",
  },
  neutral: {
    icon: Minus,
    color: "text-slate-600",
    background: "bg-slate-100/80",
  },
};

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend = "neutral",
  trendLabel,
}) {
  const trendStyle = trendConfig[trend] ?? trendConfig.neutral;
  const TrendIcon = trendStyle.icon;

  return (
    <article className="group relative isolate min-h-[150px] overflow-hidden rounded-2xl border border-white/80 bg-white/65 p-5 shadow-[0_12px_36px_rgba(15,70,45,0.07)] backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-emerald-200/90 hover:shadow-[0_16px_38px_rgba(15,70,45,0.11)] sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -top-10 -z-10 size-28 rounded-full bg-gradient-to-br from-emerald-100/70 to-lime-100/40 blur-2xl transition group-hover:scale-125"
      />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 break-words text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {value}
          </p>
        </div>

        {Icon && (
          <div className="grid size-11 shrink-0 place-items-center rounded-2xl border border-white/80 bg-gradient-to-br from-emerald-100/90 to-lime-50/90 text-emerald-700 shadow-sm">
            <Icon size={21} strokeWidth={1.8} />
          </div>
        )}
      </div>

      {(description || trendLabel) && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          {trendLabel && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-medium ${trendStyle.color} ${trendStyle.background}`}
            >
              <TrendIcon size={13} />
              {trendLabel}
            </span>
          )}

          {description && <span className="text-slate-500">{description}</span>}
        </div>
      )}
    </article>
  );
}
