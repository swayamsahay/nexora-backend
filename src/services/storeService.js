import Store from "../models/Store.js";
import { createError } from "../utils/apiResponse.js";

const toStoreResponse = (store) => ({
  id: store._id,
  name: store.name,
  slug: store.slug,
  userId: store.userId,
  description: store.description,
  theme: store.theme,
  isPublished: store.isPublished,
  createdAt: store.createdAt,
  updatedAt: store.updatedAt,
});

const slugify = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const buildUniqueSlug = async (name, currentStoreId = null) => {
  const baseSlug = slugify(name);
  if (!baseSlug) {
    throw createError("Store name must include letters or numbers.", 400);
  }

  let slug = baseSlug;
  let counter = 0;

  while (
    await Store.findOne({
      slug,
      ...(currentStoreId ? { _id: { $ne: currentStoreId } } : {}),
    })
  ) {
    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }

  return slug;
};

export const createStoreForUser = async (userId, payload) => {
  const { name } = payload;

  if (!name || !name.trim()) {
    throw createError("Store name is required.", 400);
  }

  const existingStore = await Store.findOne({ userId });
  if (existingStore) {
    throw createError("User already has a store.", 409);
  }

  const slug = await buildUniqueSlug(name);

  const store = await Store.create({
    name: name.trim(),
    slug,
    userId,
  });

  return toStoreResponse(store);
};

export const getStoreByUserId = async (userId) => {
  const store = await Store.findOne({ userId });
  if (!store) {
    throw createError("Store not found.", 404);
  }

  return toStoreResponse(store);
};

export const getStoreBySlug = async (slug) => {
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

  return toStoreResponse(store);
};

export const updateStoreByUserId = async (userId, payload) => {
  const store = await Store.findOne({ userId });
  if (!store) {
    throw createError("Store not found.", 404);
  }

  const { name, description, theme, isPublished } = payload;

  if (name !== undefined) {
    if (!name.trim()) {
      throw createError("Store name cannot be empty.", 400);
    }

    const newName = name.trim();
    if (newName !== store.name) {
      store.name = newName;
      store.slug = await buildUniqueSlug(newName, store._id);
    }
  }

  if (description !== undefined) {
    store.description = description;
  }

  if (theme !== undefined) {
    store.theme = theme;
  }

  if (isPublished !== undefined) {
    store.isPublished = Boolean(isPublished);
  }

  await store.save();
  return toStoreResponse(store);
};

export const deleteStoreByUserId = async (userId) => {
  const store = await Store.findOne({ userId });
  if (!store) {
    throw createError("Store not found.", 404);
  }

  await store.deleteOne();
  return { message: "Store deleted successfully." };
};