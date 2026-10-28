// Single place to adjust anything that depends on the backend contract.
// These names are best-guess defaults and MUST be checked against
// https://e-commerce-api-3wara.vercel.app/api-docs (see the report).

export const PAGE_SIZE = 10;

// Query param used by GET /products/search
export const SEARCH_PARAM = "q";

// Multipart field names sent on create / update
export const FIELDS = {
  name: "name",
  description: "description",
  price: "price",
  stock: "stock",
  category: "category",
  brand: "brand",
  images: "images", // repeated once per file
  removedImages: "removedImages", // repeated once per image to delete (edit only)
};
