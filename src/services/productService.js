import Product from "../models/Product.js";
import Store from "../models/Store.js";
import { createError } from "../utils/apiResponse.js";

const toProductResponse = (product) => ({
  id: product._id,
  name: product.name,
  price: product.price,
  image: product.image,
  description: product.description,
  stock: product.stock,
  isAvailable: product.isAvailable,
  storeId: product.storeId,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
});

const getStoreForOwner = async (userId) => {
  const store = await Store.findOne({ userId });
  if (!store) {
    throw createError("Store not found for this user.", 404);
  }

  return store;
};

export const createProductForOwner = async (userId, payload) => {
  const { name, price, image, description, stock } = payload;

  if (!name || !name.trim()) {
    throw createError("Product name is required.", 400);
  }

  if (price === undefined || Number.isNaN(Number(price))) {
    throw createError("Valid product price is required.", 400);
  }

  if (Number(price) < 0) {
    throw createError("Product price cannot be negative.", 400);
  }

  const ownerStore = await getStoreForOwner(userId);

  if (stock !== undefined && Number(stock) < 0) {
    throw createError("Stock cannot be negative.", 400);
  }

  const stockValue = stock !== undefined ? Number(stock) : 0;

  const product = await Product.create({
    name: name.trim(),
    price: Number(price),
    image: image || "",
    description: description || "",
    stock: stockValue,
    isAvailable: stockValue > 0,
    storeId: ownerStore._id,
  });

  return toProductResponse(product);
};

export const getProductsForOwner = async (userId, options = {}) => {
  const page = Number(options.page) > 0 ? Number(options.page) : 1;
  const limit = Number(options.limit) > 0 ? Math.min(Number(options.limit), 100) : 10;
  const skip = (page - 1) * limit;
  const search = options.search?.trim();

  const store = await getStoreForOwner(userId);

  const query = { storeId: store._id };
  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  const [products, total] = await Promise.all([
    Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Product.countDocuments(query),
  ]);

  return {
    items: products.map(toProductResponse),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getAvailableProductsByStoreSlug = async (slug, options = {}) => {
  const page = Number(options.page) > 0 ? Number(options.page) : 1;
  const limit = Number(options.limit) > 0 ? Math.min(Number(options.limit), 100) : 10;
  const skip = (page - 1) * limit;
  const search = options.search?.trim();

  if (!slug || !slug.trim()) {
    throw createError("Store slug is required.", 400);
  }

  const store = await Store.findOne({ slug: slug.trim().toLowerCase() });
  if (!store) {
    throw createError("Store not found.", 404);
  }

  if (!store.isPublished) {
    throw createError("Store is not published.", 403);
  }

  const query = {
    storeId: store._id,
    isAvailable: true,
  };

  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  const [products, total] = await Promise.all([
    Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Product.countDocuments(query),
  ]);

  return {
    items: products.map(toProductResponse),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const updateProductForOwner = async (userId, productId, payload) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw createError("Product not found.", 404);
  }

  const store = await Store.findById(product.storeId);
  if (!store) {
    throw createError("Store not found for this product.", 404);
  }

  if (store.userId.toString() !== userId.toString()) {
    throw createError("You are not allowed to update this product.", 403);
  }

  const { name, price, stock, description, isAvailable } = payload;

  if (name !== undefined) {
    if (!name.trim()) {
      throw createError("Product name cannot be empty.", 400);
    }

    product.name = name.trim();
  }

  if (price !== undefined) {
    if (Number.isNaN(Number(price)) || Number(price) < 0) {
      throw createError("Price must be a non-negative number.", 400);
    }

    product.price = Number(price);
  }

  if (stock !== undefined) {
    if (Number.isNaN(Number(stock)) || Number(stock) < 0) {
      throw createError("Stock must be a non-negative number.", 400);
    }

    product.stock = Number(stock);
    if (product.stock <= 0) {
      product.isAvailable = false;
    }
  }

  if (description !== undefined) {
    product.description = description;
  }

  if (isAvailable !== undefined) {
    product.isAvailable = Boolean(isAvailable);
  }

  await product.save();
  return toProductResponse(product);
};

export const deleteProductForOwner = async (userId, productId) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw createError("Product not found.", 404);
  }

  const store = await Store.findById(product.storeId);
  if (!store) {
    throw createError("Store not found for this product.", 404);
  }

  if (store.userId.toString() !== userId.toString()) {
    throw createError("You are not allowed to delete this product.", 403);
  }

  await product.deleteOne();
  return { message: "Product deleted successfully." };
};