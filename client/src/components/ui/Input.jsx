import { forwardRef, useId } from "react";

const Input = forwardRef(function Input(
  { label, error, hint, id, className = "", wrapperClassName = "", ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId = error
    ? `${inputId}-error`
    : hint
      ? `${inputId}-hint`
      : undefined;

  return (
    <div className={`grid gap-1.5 ${wrapperClassName}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}

      <input
        ref={ref}
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={descriptionId}
        className={[
          "w-full rounded-xl border bg-white/70 px-3 py-2.5 text-sm text-slate-800 shadow-sm backdrop-blur",
          "placeholder:text-slate-400 transition duration-200",
          "focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10",
          "disabled:cursor-not-allowed disabled:bg-slate-50/70 disabled:text-slate-400",
          error
            ? "border-rose-300 focus:border-rose-400 focus:ring-rose-500/10"
            : "border-emerald-950/10",
          className,
        ].join(" ")}
        {...props}
      />

      {error ? (
        <p id={`${inputId}-error`} className="text-xs text-rose-700">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export default Input;
