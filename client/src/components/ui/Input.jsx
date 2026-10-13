import { forwardRef, useId } from "react";

const Input = forwardRef(function Input(
  { label, error, hint, id, className = "", wrapperClassName = "", ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

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
        aria-describedby={
          error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
        }
        className={[
          "w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800",
          "placeholder:text-slate-400 transition-colors",
          "focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15",
          "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400",
          error ? "border-red-400" : "border-slate-200",
          className,
        ].join(" ")}
        {...props}
      />

      {error ? (
        <p id={`${inputId}-error`} className="text-xs text-red-600">
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
