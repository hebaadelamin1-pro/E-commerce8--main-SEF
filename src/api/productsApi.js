import api from "./axios";
import { FIELDS, SEARCH_PARAM } from "../pages/products/productConfig";

const clean = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== "" && v != null));

export const fetchProducts = ({ page, limit, search, category, brand }) => {
  const params = clean({ page, limit, category, brand });
  if (search) return api.get("/products/search", { params: { ...params, [SEARCH_PARAM]: search } });
  return api.get("/products", { params });
};

export function buildProductFormData(values, newFiles = [], removedImages = []) {
  const fd = new FormData();
  
  // الحقول الأساسية
  fd.append(FIELDS.name, values.name?.trim() || "");
  
  // الحقول الجديدة المضافة من الـ JSON
  if (values.slug) fd.append("slug", values.slug.trim());
  if (values.shortDescription) fd.append("shortDescription", values.shortDescription.trim());
  
  fd.append(FIELDS.description, values.description?.trim() || "");
  fd.append(FIELDS.price, String(values.price));
  
  if (values.discountPrice) fd.append("discountPrice", String(values.discountPrice));
  
  fd.append(FIELDS.stock, String(values.stock));
  
  if (values.sku) fd.append("sku", values.sku.trim());
  
  fd.append(FIELDS.category, values.category?.trim() || "");
  
  if (values.subcategory) fd.append("subcategory", values.subcategory.trim());
  
  fd.append(FIELDS.brand, values.brand?.trim() || "");
  
  // التعامل مع الـ tags لو موجودة (لو متجاوزة كـ Array أو String)
  if (values.tags) {
    const tagsArray = Array.isArray(values.tags) ? values.tags : values.tags.split(",");
    tagsArray.forEach((tag) => fd.append("tags[]", tag.trim()));
  }

  // الصور والملفات
  newFiles.forEach((f) => fd.append(FIELDS.images, f));
  removedImages.forEach((u) => fd.append(FIELDS.removedImages, u));
  
  return fd;
}

// Axios sets the multipart boundary automatically when given FormData.
export const createProduct = (formData) => api.post("/products", formData);
export const updateProduct = (id, formData) => api.patch(`/products/update/${id}`, formData);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

export function quickUpdateProduct(id, { price, stock }) {
  const fd = new FormData();
  fd.append(FIELDS.price, String(price));
  fd.append(FIELDS.stock, String(stock));
  return api.patch(`/products/update/${id}`, fd);
}