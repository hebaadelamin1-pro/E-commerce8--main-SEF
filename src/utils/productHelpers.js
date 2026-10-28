// Defensive normalizers: the page keeps working whether the API returns
// a bare array or an object such as { products, totalPages, ... }.

const pickName = (v) => (v && typeof v === "object" ? v.name ?? v.title ?? "" : v ?? "");

function toUrl(img) {
  if (!img) return null;
  if (typeof img === "string") return img;
  return img.url ?? img.secure_url ?? img.path ?? null;
}

export function normalizeProduct(p) {
  const rawImages = p.images ?? p.image ?? p.thumbnail ?? [];
  const list = Array.isArray(rawImages) ? rawImages : [rawImages];
  return {
    id: p._id ?? p.id,
    name: p.name ?? p.title ?? "",
    description: p.description ?? "",
    price: Number(p.price ?? 0),
    stock: Number(p.stock ?? p.quantity ?? p.countInStock ?? 0),
    category: String(pickName(p.category)),
    brand: String(pickName(p.brand)),
    images: list.map(toUrl).filter(Boolean),
    subCategory: String(pickName(p.subCategory ?? p.subcategory ?? "")),
    featured: Boolean(p.featured ?? p.isFeatured ?? false),
    tags: Array.isArray(p.tags) ? p.tags.map(String) : [],
    originalPrice: Number(p.originalPrice ?? p.compareAtPrice ?? p.oldPrice ?? 0),
  };
}

export function extractList(data) {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];
  const candidates = [
    data.products,
    data.data,
    data.items,
    data.results,
    data.data?.products,
    data.data?.items,
  ];
  return candidates.find(Array.isArray) ?? [];
}

// Returns { totalPages, total } when the API reports pagination, else null.
export function extractMeta(data, limit) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const src = data.pagination ?? data.meta ?? data;
  const totalPages = src.totalPages ?? src.pages ?? src.lastPage ?? src.total_pages;
  const total = src.total ?? src.totalProducts ?? src.count ?? src.totalItems;
  if (totalPages != null) return { totalPages: Number(totalPages), total: total != null ? Number(total) : null };
  if (total != null && limit) return { totalPages: Math.max(1, Math.ceil(Number(total) / limit)), total: Number(total) };
  return null;
}

export function getErrorMessage(err, fallback = "Something went wrong.") {
  if (err?.response?.status === 401 || err?.response?.status === 403) {
    return "You are not authorized. Admin login is required for this action.";
  }
  const d = err?.response?.data;
  return d?.message || d?.error || (typeof d === "string" && d.length < 200 ? d : null) || err?.message || fallback;
}

export const formatPrice = (n) =>
  Number.isFinite(n) ? n.toLocaleString(undefined, { style: "currency", currency: "USD" }) : "—";
