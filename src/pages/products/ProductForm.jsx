import { useEffect, useMemo, useState } from "react";
import Button from "../../components/ui/Button";

const empty = { name: "", description: "", price: "", stock: "", category: "", brand: "" };
const input =
  "w-full rounded-xl border bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20";

function validate(v) {
  const e = {};
  if (!v.name.trim()) e.name = "Name is required.";
  else if (v.name.trim().length < 2) e.name = "Name must be at least 2 characters.";
  if (v.price === "" || Number.isNaN(Number(v.price))) e.price = "Price is required.";
  else if (Number(v.price) < 0) e.price = "Price cannot be negative.";
  if (v.stock === "" || Number.isNaN(Number(v.stock))) e.stock = "Stock is required.";
  else if (!Number.isInteger(Number(v.stock)) || Number(v.stock) < 0) e.stock = "Stock must be a whole number ≥ 0.";
  if (!v.category.trim()) e.category = "Category is required.";
  if (!v.brand.trim()) e.brand = "Brand is required.";
  return e;
}

export default function ProductForm({ product, submitting, serverError, onSubmit, onCancel }) {
  const isEdit = Boolean(product);
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState({});
  const [files, setFiles] = useState([]);
  const [removed, setRemoved] = useState([]);

  useEffect(() => {
    setValues(
      product
        ? {
            name: product.name,
            description: product.description,
            price: String(product.price),
            stock: String(product.stock),
            category: product.category,
            brand: product.brand,
          }
        : empty
    );
    setFiles([]);
    setRemoved([]);
    setErrors({});
  }, [product]);

  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews]);

  const existing = (product?.images ?? []).filter((u) => !removed.includes(u));

  const set = (k) => (e) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  function addFiles(e) {
    const picked = Array.from(e.target.files ?? []);
    if (picked.some((f) => !f.type.startsWith("image/"))) {
      setErrors((er) => ({ ...er, images: "Only image files are allowed." }));
    } else {
      setErrors((er) => ({ ...er, images: undefined }));
      setFiles((prev) => [...prev, ...picked]);
    }
    e.target.value = "";
  }

  function handleSubmit(e) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;
    onSubmit(values, files, removed);
  }

  const field = (id, label, props = {}) => (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-300">{label}</label>
      <input
        id={id}
        value={values[id]}
        onChange={set(id)}
        aria-invalid={Boolean(errors[id])}
        className={`${input} ${errors[id] ? "border-red-400" : "border-white/10"}`}
        {...props}
      />
      {errors[id] && <p className="mt-1 text-xs text-red-400">{errors[id]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {field("name", "Name")}
      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-slate-300">Description</label>
        <textarea id="description" rows={3} value={values.description} onChange={set("description")} className={`${input} border-white/10`} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {field("price", "Price", { type: "number", min: "0", step: "0.01" })}
        {field("stock", "Stock", { type: "number", min: "0", step: "1" })}
        {field("category", "Category")}
        {field("brand", "Brand")}
      </div>

      <div>
        <label htmlFor="images" className="mb-1 block text-sm font-medium text-slate-300">Images</label>
        <input id="images" type="file" accept="image/*" multiple onChange={addFiles} className="block w-full text-sm text-slate-400 file:mr-3 file:rounded-xl file:border-0 file:bg-cyan-500/15 file:px-3 file:py-2 file:font-semibold file:text-cyan-300" />
        {errors.images && <p className="mt-1 text-xs text-red-400">{errors.images}</p>}
        {(existing.length > 0 || files.length > 0) && (
          <ul className="mt-3 flex flex-wrap gap-3">
            {existing.map((u) => (
              <li key={u} className="relative">
                <img src={u} alt="Current" className="h-20 w-20 rounded-xl border border-white/10 object-cover" />
                <button type="button" aria-label="Remove image" onClick={() => setRemoved((r) => [...r, u])} className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-red-600 text-sm text-white">×</button>
              </li>
            ))}
            {previews.map((u, i) => (
              <li key={u} className="relative">
                <img src={u} alt="New upload" className="h-20 w-20 rounded-xl border-2 border-cyan-400/60 object-cover" />
                <button type="button" aria-label="Remove new image" onClick={() => setFiles((f) => f.filter((_, j) => j !== i))} className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-red-600 text-sm text-white">×</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {serverError && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{serverError}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onCancel} disabled={submitting}>Cancel</Button>
        <Button type="submit" loading={submitting}>{isEdit ? "Save changes" : "Add product"}</Button>
      </div>
    </form>
  );
}
