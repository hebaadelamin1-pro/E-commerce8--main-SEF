const variants = {
  primary: "bg-cyan-500 text-slate-950 hover:bg-cyan-400 focus:ring-cyan-400",
  secondary: "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 focus:ring-white/30",
  danger: "border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 focus:ring-red-400",
  ghost: "text-cyan-300 border border-cyan-400/30 bg-cyan-400/10 hover:bg-cyan-400/20 focus:ring-cyan-400",
};

export default function Button({ variant = "primary", className = "", loading = false, disabled, children, ...props }) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </button>
  );
}
