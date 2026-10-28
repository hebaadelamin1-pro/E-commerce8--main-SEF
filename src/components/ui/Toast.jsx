import { useEffect } from "react";

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;
  const color = toast.type === "error" ? "border-red-400/40 bg-red-950 text-red-200" : "border-emerald-400/40 bg-emerald-950 text-emerald-200";
  return (
    <div role="status" className={`fixed bottom-6 right-6 z-[60] flex items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg ${color}`}>
      <span>{toast.message}</span>
      <button type="button" onClick={onClose} aria-label="Dismiss" className="text-lg leading-none">×</button>
    </div>
  );
}
