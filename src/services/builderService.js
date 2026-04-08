import Store from "../models/Store.js";
import Website from "../models/Website.js";
import { createError } from "../utils/apiResponse.js";

const defaultLayout = {
  header: {
    title: "Nexora Store",
    subtitle: "Build your storefront with confidence",
  },
  sections: [],
  theme: {
    accent: "#0f172a",
    background: "#f8fafc",
    text: "#0f172a",
  },
};

const normalizeLayout = (layout) => {
  const input = layout && typeof layout === "object" ? layout : {};

  return {
    header: input.header && typeof input.header === "object" ? input.header : {},
    sections: Array.isArray(input.sections) ? input.sections : [],
    theme: input.theme && typeof input.theme === "object" ? input.theme : {},
  };
};

const toWebsiteResponse = (website) => ({
  id: website._id,
  user: website.user,
  store: website.store,
  layout: website.layout,
  theme: website.theme,
  isPublished: website.isPublished,
  domain: website.domain,
  createdAt: website.createdAt,
  updatedAt: website.updatedAt,
});

const ensureStoreOwnership = async (userId, storeId) => {
  const store = await Store.findOne({ _id: storeId, userId });
  if (!store) {
    throw createError("Store not found for this user.", 404);
  }

  return store;
};

export const saveWebsiteLayout = async (userId, payload) => {
  const { storeId, layout, theme, domain } = payload;

  if (!storeId) {
    throw createError("storeId is required.", 400);
  }

  await ensureStoreOwnership(userId, storeId);

  const nextLayout = normalizeLayout(layout || defaultLayout);
  const nextTheme =
    theme && typeof theme === "object" ? theme : nextLayout.theme || {};

  const website = await Website.findOneAndUpdate(
    { store: storeId },
    {
      user: userId,
      store: storeId,
      layout: nextLayout,
      theme: nextTheme,
      ...(domain !== undefined ? { domain } : {}),
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return toWebsiteResponse(website);
};

export const getWebsiteLayoutByStore = async (userId, storeId) => {
  if (!storeId) {
    throw createError("storeId is required.", 400);
  }

  await ensureStoreOwnership(userId, storeId);

  let website = await Website.findOne({ store: storeId });
  if (!website) {
    website = await Website.create({
      user: userId,
      store: storeId,
      layout: defaultLayout,
      theme: defaultLayout.theme,
    });
  }

  return toWebsiteResponse(website);
};

export const publishWebsite = async (userId, payload) => {
  const { storeId, isPublished } = payload;

  if (!storeId) {
    throw createError("storeId is required.", 400);
  }

  await ensureStoreOwnership(userId, storeId);

  const website = await Website.findOneAndUpdate(
    { store: storeId },
    {
      user: userId,
      store: storeId,
      isPublished: isPublished === undefined ? true : Boolean(isPublished),
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return toWebsiteResponse(website);
};

export const getPublishedWebsiteByStore = async (storeId) => {
  if (!storeId) {
    throw createError("storeId is required.", 400);
  }

  const website = await Website.findOne({ store: storeId, isPublished: true });
  if (!website) {
    throw createError("Published website not found.", 404);
  }

  return toWebsiteResponse(website);
};