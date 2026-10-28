import { useState } from "react";
import Button from "../../components/ui/Button";

export default function QuickEditForm({ product, submitting, serverError, onSubmit, onCancel }) {
  const [price, setPrice] = useState(String(product.price));
  const [stock, setStock] = useState(String(product.stock));
  const [err, setErr] = useState("");
  const cls = "w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400";

  function submit(e) {
    e.preventDefault();
    if (price === "" || Number(price) < 0 || Number.isNaN(Number(price))) return setErr("Enter a valid price.");
    if (stock === "" || !Number.isInteger(Number(stock)) || Number(stock) < 0) return setErr("Stock must be a whole number ≥ 0.");
    setErr("");
    onSubmit({ price: Number(price), stock: Number(stock) });
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <p className="text-sm text-slate-400">{product.name}</p>
      <div className="grid grid-cols-2 gap-4">
        <label className="text-sm text-slate-300">Price
          <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className={`${cls} mt-1`} />
        </label>
        <label className="text-sm text-slate-300">Stock
          <input type="number" min="0" step="1" value={stock} onChange={(e) => setStock(e.target.value)} className={`${cls} mt-1`} />
        </label>
      </div>
      {(err || serverError) && <p role="alert" className="text-sm text-red-400">{err || serverError}</p>}
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={submitting}>Cancel</Button>
        <Button type="submit" loading={submitting}>Save</Button>
      </div>
    </form>
  );
}
