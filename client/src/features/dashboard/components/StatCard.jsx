import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

const trendConfig = {
  up: {
    icon: ArrowUpRight,
    color: "text-emerald-600",
    background: "bg-emerald-50",
  },
  down: {
    icon: ArrowDownRight,
    color: "text-rose-600",
    background: "bg-rose-50",
  },
  neutral: {
    icon: Minus,
    color: "text-slate-500",
    background: "bg-slate-100",
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
    <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {value}
          </p>
        </div>

        {Icon && (
          <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
            <Icon size={21} strokeWidth={1.8} />
          </div>
        )}
      </div>

      {(description || trendLabel) && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          {trendLabel && (
            <span
              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 font-medium ${trendStyle.color} ${trendStyle.background}`}
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
