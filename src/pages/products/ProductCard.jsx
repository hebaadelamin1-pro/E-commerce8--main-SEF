import { useState } from "react";
import Button from "../../components/ui/Button";
import { formatPrice } from "../../utils/productHelpers";

export default function ProductCard({ product: p, onView, onEdit, onQuickEdit, onDelete }) {
  const [i, setI] = useState(0);
  const n = p.images.length;
  const go = (d) => setI((v) => (v + d + n) % n);
  const crumbs = [p.category, p.subCategory, p.brand].filter(Boolean).join(" · ");
  const off = p.originalPrice > p.price ? p.originalPrice - p.price : 0;

  return (
    <article className="flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 shadow-lg">
      <div className="relative aspect-[4/3] bg-slate-800">
        {n > 0 ? (
          <img src={p.images[i]} alt={p.name} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">No image</div>
        )}
        {p.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-slate-900">★ Featured</span>
        )}
        {n > 1 && (
          <>
            <button type="button" aria-label="Previous image" onClick={() => go(-1)} className="absolute left-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70">‹</button>
            <button type="button" aria-label="Next image" onClick={() => go(1)} className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70">›</button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {p.images.map((_, k) => (
                <span key={k} className={`h-1.5 w-1.5 rounded-full ${k === i ? "bg-cyan-400" : "bg-white/60"}`} />
              ))}
            </div>
          </>
        )}
        <span className={`absolute bottom-3 right-3 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur ${p.stock > 0 ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}>
          {p.stock > 0 ? `${p.stock} in stock` : "Out of Stock"}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-bold text-white">{p.name}</h3>
        {crumbs && <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">{crumbs}</p>}
        {p.description && <p className="mt-2 line-clamp-2 text-sm text-slate-400">{p.description}</p>}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-white">{formatPrice(p.price)}</span>
          {off > 0 && <span className="text-xs font-semibold text-emerald-400">−{formatPrice(off)} off</span>}
        </div>
        {p.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {p.tags.map((t) => (
              <span key={t} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-slate-300">{t}</span>
            ))}
          </div>
        )}
        <div className="mt-auto grid grid-cols-3 gap-2 border-t border-white/10 pt-4 mt-4">
          <Button variant="secondary" className="px-2" onClick={() => onView(p)}>View</Button>
          <Button variant="secondary" className="px-2" onClick={() => onEdit(p)}>Edit</Button>
          <Button variant="secondary" className="px-2" onClick={() => onQuickEdit(p)}>Quick Edit</Button>
          <Button variant="danger" className="col-span-3" onClick={() => onDelete(p)}>Delete</Button>
        </div>
      </div>
    </article>
  );
}
