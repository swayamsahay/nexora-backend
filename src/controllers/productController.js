import {
  createProductForOwner,
  deleteProductForOwner,
  getAvailableProductsByStoreSlug,
  getProductsForOwner,
  updateProductForOwner,
} from "../services/productService.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const createProduct = asyncHandler(async (req, res) => {
  const product = await createProductForOwner(req.user.id, req.body);
  return sendSuccess(res, 201, { product }, "Product created successfully.");
});

export const getMyStoreProducts = asyncHandler(async (req, res) => {
  const products = await getProductsForOwner(req.user.id, {
    page: req.query.page,
    limit: req.query.limit,
    search: req.query.search,
  });
  return sendSuccess(res, 200, products);
});

export const getPublicProductsByStoreSlug = asyncHandler(async (req, res) => {
  const products = await getAvailableProductsByStoreSlug(req.params.slug, {
    page: req.query.page,
    limit: req.query.limit,
    search: req.query.search,
  });
  return sendSuccess(res, 200, products);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await updateProductForOwner(req.user.id, req.params.productId, req.body);
  return sendSuccess(res, 200, { product }, "Product updated successfully.");
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const result = await deleteProductForOwner(req.user.id, req.params.productId);
  return sendSuccess(res, 200, result);
});