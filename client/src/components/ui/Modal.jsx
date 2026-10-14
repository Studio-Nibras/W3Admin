import { useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
}) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") onClose?.();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/25 p-4 backdrop-blur-md"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={[
          "max-h-[90vh] w-full overflow-y-auto rounded-2xl",
          "border border-white/80 bg-white/85 shadow-[0_24px_80px_rgba(15,70,45,0.22)] backdrop-blur-2xl",
          sizes[size] ?? sizes.md,
        ].join(" ")}
      >
        <header className="flex items-start justify-between gap-4 border-b border-emerald-950/5 px-5 py-4">
          <div className="grid gap-1">
            <h2 id={titleId} className="text-base font-semibold text-slate-900">
              {title}
            </h2>

            {description && (
              <p className="text-sm text-slate-500">{description}</p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-xl p-1.5 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <X size={18} />
          </button>
        </header>

        <div className="p-5">{children}</div>
      </section>
    </div>,
    document.body,
  );
}
