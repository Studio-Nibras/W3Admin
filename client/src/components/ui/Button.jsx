import { LoaderCircle } from "lucide-react";

const variants = {
  primary:
    "bg-gradient-to-r from-emerald-600 to-green-700 text-white shadow-sm shadow-emerald-800/15 hover:from-emerald-700 hover:to-green-800 hover:shadow-md hover:shadow-emerald-800/20",
  secondary:
    "border border-emerald-950/10 bg-white/65 text-slate-700 shadow-sm backdrop-blur-xl hover:border-emerald-200 hover:bg-emerald-50/80 hover:text-emerald-800",
  danger:
    "bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-sm shadow-rose-800/15 hover:from-rose-700 hover:to-red-700",
  ghost: "text-slate-600 hover:bg-emerald-50/80 hover:text-emerald-800",
};

const sizes = {
  sm: "min-h-8 px-3 py-1.5 text-xs",
  md: "min-h-10 px-4 py-2 text-sm",
  lg: "min-h-11 px-5 py-2.5 text-sm",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant] ?? variants.primary,
        sizes[size] ?? sizes.md,
        className,
      ].join(" ")}
      {...props}
    >
      {loading && <LoaderCircle size={16} className="animate-spin" />}
      {children}
    </button>
  );
}
