import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Toast from "../../components/ui/Toast";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import "./Products.css";
import {
  fetchProducts,
  buildProductFormData,
  createProduct,
  updateProduct,
  deleteProduct,
  quickUpdateProduct,
} from "../../api/productsApi";
import { extractList, extractMeta, normalizeProduct, getErrorMessage, formatPrice } from "../../utils/productHelpers";
import { PAGE_SIZE } from "./productConfig";
import ProductForm from "./ProductForm";
import QuickEditForm from "./QuickEditForm";
import Pagination from "./Pagination";

const sel = "rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-400";
const card = "rounded-3xl border border-white/10 bg-white/[0.03]";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [serverMode, setServerMode] = useState(false);
  const [serverMeta, setServerMeta] = useState(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [quick, setQuick] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [knownCategories, setKnownCategories] = useState([]);
  const [knownBrands, setKnownBrands] = useState([]);
  const serverModeRef = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const serverPage = serverMode ? page : 1;
  const serverSearch = serverMode ? search : "";
  const serverCategory = serverMode ? category : "";
  const serverBrand = serverMode ? brand : "";

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const params = serverModeRef.current
          ? { page: serverPage, limit: PAGE_SIZE, search: serverSearch, category: serverCategory, brand: serverBrand }
          : { page: 1, limit: PAGE_SIZE };
        const res = await fetchProducts(params);
        if (cancelled) return;
        const list = extractList(res.data).map(normalizeProduct);
        const meta = extractMeta(res.data, PAGE_SIZE);
        const useServer = Boolean(meta && meta.totalPages >= 1);
        serverModeRef.current = useServer;
        setServerMode(useServer);
        setServerMeta(meta);
        setProducts(list);
        setKnownCategories((prev) => [...new Set([...prev, ...list.map((p) => p.category).filter(Boolean)])].sort());
        setKnownBrands((prev) => [...new Set([...prev, ...list.map((p) => p.brand).filter(Boolean)])].sort());
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err, "Failed to load products."));
          setProducts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [serverPage, serverSearch, serverCategory, serverBrand, refreshKey]);

  const filtered = useMemo(() => {
    if (serverMode) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) =>
        (!q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)) &&
        (!category || p.category === category) &&
        (!brand || p.brand === brand)
    );
  }, [products, serverMode, search, category, brand]);

  const totalPages = serverMode
    ? Math.max(1, serverMeta?.totalPages ?? 1)
    : Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = serverMode ? filtered : filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const hasFilters = Boolean(searchInput || category || brand);
  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setCategory("");
    setBrand("");
    setPage(1);
  };

  const reload = useCallback(() => setRefreshKey((k) => k + 1), []);

  function openAdd() {
    setEditing(null);
    setFormError("");
    setFormOpen(true);
  }
  function openEdit(p) {
    setEditing(p);
    setFormError("");
    setFormOpen(true);
  }
  const closeForm = () => !submitting && setFormOpen(false);

  async function handleSubmit(values, files, removed) {
    setSubmitting(true);
    setFormError("");
    try {
      const fd = buildProductFormData(values, files, editing ? removed : []);
      if (editing) await updateProduct(editing.id, fd);
      else await createProduct(fd);
      setFormOpen(false);
      setToast({ type: "success", message: editing ? "Product updated successfully." : "Product created successfully." });
      reload();
    } catch (err) {
      setFormError(getErrorMessage(err, "Failed to save product."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleQuickEdit(vals) {
    setSubmitting(true);
    setFormError("");
    try {
      await quickUpdateProduct(quick.id, vals);
      setQuick(null);
      setToast({ type: "success", message: "Product updated successfully." });
      reload();
    } catch (err) {
      setFormError(getErrorMessage(err, "Failed to update product."));
    } finally {
      setSubmitting(false);
    }
  }

  const stats = [
    { label: "Total", value: serverMeta?.total ?? products.length, icon: "▣" },
    { label: "Featured", value: products.filter((p) => p.featured).length, icon: "☆" },
    { label: "In Stock", value: products.filter((p) => p.stock > 0).length, icon: "↗" },
    { label: "Out of Stock", value: products.filter((p) => p.stock <= 0).length, icon: "◈" },
  ];

  async function confirmDelete() {
    setDeleting(true);
    try {
      await deleteProduct(toDelete.id);
      setToast({ type: "success", message: `"${toDelete.name}" was deleted.` });
      setToDelete(null);
      if (visible.length === 1 && currentPage > 1) setPage(currentPage - 1);
      reload();
    } catch (err) {
      setToast({ type: "error", message: getErrorMessage(err, "Failed to delete product.") });
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <header className={`${card} flex flex-wrap items-center justify-between gap-4 p-6`}>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-2xl text-cyan-300">▣</div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-400">Product Dashboard</p>
            <h1 className="text-4xl font-extrabold text-white">Products</h1>
          </div>
        </div>
        <Button variant="ghost" className="px-6 py-3 text-base" onClick={openAdd}>+ Add Product</Button>
      </header>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Product statistics">
        {stats.map((st) => (
          <div key={st.label} className={`${card} p-5`}>
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300">{st.icon}</div>
            <p className="text-3xl font-extrabold text-white">{st.value}</p>
            <p className="text-sm text-slate-400">{st.label}</p>
          </div>
        ))}
      </section>

      <section className={`${card} p-4`}>
        <form
          className="flex flex-wrap items-center gap-3"
          onSubmit={(e) => { e.preventDefault(); setSearch(searchInput.trim()); setPage(1); }}
        >
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products..."
            aria-label="Search products"
            className="min-w-[12rem] flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400"
          />
          <Button variant="secondary" className="py-3" aria-expanded={showFilters} onClick={() => setShowFilters((v) => !v)}>Filters</Button>
          <Button type="submit" className="py-3 px-6">Search</Button>
        </form>
        {showFilters && (
          <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-white/10 pt-3">
            <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} aria-label="Filter by category" className={sel}>
              <option value="">All categories</option>
              {knownCategories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={brand} onChange={(e) => { setBrand(e.target.value); setPage(1); }} aria-label="Filter by brand" className={sel}>
              <option value="">All brands</option>
              {knownBrands.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            {hasFilters && <Button variant="secondary" onClick={clearFilters}>Clear filters</Button>}
          </div>
        )}
      </section>

      {loading ? (
        <div className={`${card} flex flex-col items-center gap-3 py-16`}>
          <LoadingSpinner size="lg" />
          <p className="text-sm text-slate-400">Loading products…</p>
        </div>
      ) : error ? (
        <div role="alert" className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-center">
          <p className="mb-3 text-sm text-red-300">{error}</p>
          <Button variant="secondary" onClick={reload}>Try again</Button>
        </div>
      ) : visible.length === 0 ? (
        <div className={`${card} border-dashed py-16 text-center`}>
          <p className="font-medium text-slate-300">{hasFilters ? "No products match your filters." : "No products yet."}</p>
          <div className="mt-3">
            {hasFilters ? <Button variant="secondary" onClick={clearFilters}>Clear filters</Button> : <Button onClick={openAdd}>Add your first product</Button>}
          </div>
        </div>
      ) : (
        <>
          <div className="products-grid">
            {visible.map((p) => (
              <div key={p.id} className="product-card-item">
                
                {/* حاوية الصورة والأسهم */}
                <div className="product-image-container">
                  <img 
                    src={p.images?.[0] || p.image || "https://via.placeholder.com/300"} 
                    alt={p.name} 
                  />
                  
                  <span className={`product-stock-badge ${p.stock > 0 ? 'stock-in' : 'stock-out'}`}>
                    {p.stock > 0 ? `${p.stock} in stock` : 'Out of Stock'}
                  </span>

                  <button className="slider-arrow left" aria-label="Previous image">‹</button>
                  <button className="slider-arrow right" aria-label="Next image">›</button>
                </div>

                {/* المحتوى */}
                <div className="product-content">
                  <p className="product-category-brand">
                    {p.category || "ELECTRONICS"} · {p.brand || "BRAND"}
                  </p>
                  
                  {/* العنوان بخط عريض وبارز */}
                  <h3 className="product-title font-bold text-white">{p.name}</h3>
                  <p className="product-description">{p.description || "No description available."}</p>

                  {/* السعر وجنبه الـ off */}
                  <div className="product-pricing">
                    <span className="product-price">${p.price ?? 0}</span>
                    {(p.discountPrice || p.originalPrice) && (
                      <span className="product-discount">
                        -${p.discountPrice || (p.originalPrice - p.price)} off
                      </span>
                    )}
                  </div>
                  
                  {/* السعر وجنبه الـ off (مع إظهار خصم افتراضي شيك لو مش متوفر في الداتا) */}
{/* <div className="product-pricing">
  <span className="product-price">${p.price ?? 0}</span>
  <span className="product-discount">
    -${p.discountPrice && p.discountPrice > 0 ? p.discountPrice : Math.round((p.price || 100) * 0.15)} off
  </span>
</div> */}

                  {/* الـ Tags الـ 4 */}
                  <div className="product-tags">
                    {(p.tags?.length > 0 ? p.tags : ["accessory", "tech", "gadget", "smart"]).slice(0, 4).map((tag, idx) => (
                      <span className="product-tag" key={idx}>{tag}</span>
                    ))}
                  </div>

                  {/* الأزرار التحتية منسقة */}
                  <div className="product-actions">
                    <button type="button" onClick={() => setViewing(p)} className="product-action-btn btn-view">View</button>
                    <button type="button" onClick={() => openEdit(p)} className="product-action-btn btn-edit">Edit</button>
                    <button type="button" onClick={() => { setFormError(""); setQuick(p); }} className="product-action-btn btn-quick">Quick Edit</button>
                    <button 
                      type="button" 
                      onClick={() => setToDelete(p)} 
                      className="product-delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      {viewing && (
        <Modal title={viewing.name} onClose={() => setViewing(null)} wide>
          {viewing.images.length > 0 && (
            <div className="mb-4 flex gap-2 overflow-x-auto">
              {viewing.images.map((u) => <img key={u} src={u} alt={viewing.name} className="h-40 rounded-xl object-cover" />)}
            </div>
          )}
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-slate-400">Price</dt><dd className="font-semibold text-white">{formatPrice(viewing.price)}</dd></div>
            <div><dt className="text-slate-400">Stock</dt><dd className="font-semibold text-white">{viewing.stock}</dd></div>
            <div><dt className="text-slate-400">Category</dt><dd className="text-white">{viewing.category || "—"}</dd></div>
            <div><dt className="text-slate-400">Brand</dt><dd className="text-white">{viewing.brand || "—"}</dd></div>
          </dl>
          {viewing.description && <p className="mt-4 text-sm text-slate-300">{viewing.description}</p>}
        </Modal>
      )}

      {quick && (
        <Modal title="Quick Edit" onClose={() => !submitting && setQuick(null)}>
          <QuickEditForm product={quick} submitting={submitting} serverError={formError} onSubmit={handleQuickEdit} onCancel={() => setQuick(null)} />
        </Modal>
      )}

      {formOpen && (
        <Modal title={editing ? "Edit product" : "Add product"} onClose={closeForm} wide>
          <ProductForm product={editing} submitting={submitting} serverError={formError} onSubmit={handleSubmit} onCancel={closeForm} />
        </Modal>
      )}

      {toDelete && (
        <Modal title="Delete product" onClose={() => !deleting && setToDelete(null)}>
          <p className="text-sm text-slate-300">
            Are you sure you want to delete <strong>{toDelete.name}</strong>? This action cannot be undone.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setToDelete(null)} disabled={deleting}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete} loading={deleting}>Delete</Button>
          </div>
        </Modal>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}