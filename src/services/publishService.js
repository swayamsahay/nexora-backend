import Store from "../models/Store.js";
import Product from "../models/Product.js";
import Website from "../models/Website.js";
import BuilderProject from "../models/BuilderProject.js";
import DevProject from "../models/DevProject.js";
import ThreeDProject from "../models/ThreeDProject.js";
import PublishedSite from "../models/PublishedSite.js";
import { createError } from "../utils/apiResponse.js";

const PUBLIC_OBJECT_LIMIT = 50;

const sanitizeText = (value) =>
  String(value || "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/[<>]/g, "")
    .trim();

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

const ensureUniquePublishedSlug = async (baseSlug, currentStoreId = null) => {
  let slug = baseSlug;
  let suffix = 0;

  while (
    await PublishedSite.findOne({
      slug,
      ...(currentStoreId ? { storeId: { $ne: currentStoreId } } : {}),
    })
  ) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  return slug;
};

const ensureStoreOwner = async (userId, storeId) => {
  const store = await Store.findOne({ _id: storeId, userId });
  if (!store) {
    throw createError("Store not found for this user.", 404);
  }

  return store;
};

const publicStoreShape = (store, publishedSite, website) => ({
  id: store._id,
  name: store.name,
  slug: publishedSite.slug,
  description: store.description,
  theme: store.theme,
  builderMode: website?.builderMode || "normal",
  customDomain: publishedSite.customDomain || "",
  isPublished: true,
});

const toPublicProduct = (product) => ({
  id: product._id,
  name: product.name,
  price: product.price,
  image: product.image,
  description: product.description,
  stock: product.stock,
  isAvailable: product.isAvailable,
  createdAt: product.createdAt,
});

const toPublicLayout = (builderProject, website) => ({
  header: website?.layout?.header || { title: builderProject?.name || "Store" },
  sections: builderProject?.layout?.sections || website?.layout?.sections || [],
  theme: builderProject?.layout?.theme || website?.layout?.theme || {},
  styles: builderProject?.layout?.styles || {},
  pages: Array.isArray(builderProject?.pages) ? builderProject.pages : [],
  components: Array.isArray(builderProject?.components) ? builderProject.components : [],
});

const toPublicThreeD = (threeDProject) => {
  if (!threeDProject) {
    return null;
  }

  return {
    builderMode: threeDProject.builderMode,
    scene: threeDProject.scene,
    lastUpdated: threeDProject.lastUpdated,
  };
};

const toPublicDev = (devProject) => {
  if (!devProject) {
    return null;
  }

  return {
    lastSynced: devProject.lastSynced,
    currentVersion: devProject.currentVersion,
    frontendPages: Array.isArray(devProject.frontendCode?.pages)
      ? devProject.frontendCode.pages.length
      : 0,
    backendRoutes: {
      publicRoutes: devProject.backendRoutes?.publicRoutes?.length || 0,
      protectedRoutes: devProject.backendRoutes?.protectedRoutes?.length || 0,
    },
    databaseCollections: devProject.databaseSchema?.collections?.length || 0,
  };
};

const buildPublicPayload = async (store, publishedSite) => {
  const [products, website, builderProject, threeDProject, devProject] = await Promise.all([
    Product.find({ storeId: store._id, isAvailable: true })
      .sort({ createdAt: -1 })
      .limit(PUBLIC_OBJECT_LIMIT),
    Website.findOne({ store: store._id }),
    BuilderProject.findOne({ storeId: store._id }),
    ThreeDProject.findOne({ storeId: store._id }),
    DevProject.findOne({ storeId: store._id }),
  ]);

  const storeData = publicStoreShape(store, publishedSite, website);
  const layout = toPublicLayout(builderProject, website);
  const scene = toPublicThreeD(threeDProject);
  const dev = toPublicDev(devProject);

  return {
    store: storeData,
    products: products.map(toPublicProduct),
    layout,
    scene,
    dev,
    published: {
      version: publishedSite.version,
      deployedAt: publishedSite.deployedAt,
      customDomain: publishedSite.customDomain || "",
    },
  };
};

export const publishSite = async (userId, payload = {}) => {
  const { storeId, customDomain = "" } = payload;

  if (!storeId) {
    throw createError("storeId is required.", 400);
  }

  const store = await ensureStoreOwner(userId, storeId);

  const baseSlug = slugify(store.slug || store.name);
  if (!baseSlug) {
    throw createError("Unable to generate a valid slug for this store.", 400);
  }

  const nextSlug = await ensureUniquePublishedSlug(baseSlug, storeId);
  const existing = await PublishedSite.findOne({ storeId });
  const nextVersion = existing ? existing.version + 1 : 1;

  const publishedSite = await PublishedSite.findOneAndUpdate(
    { storeId },
    {
      userId,
      storeId,
      slug: nextSlug,
      isPublished: true,
      customDomain: sanitizeText(customDomain),
      deployedAt: new Date(),
      version: nextVersion,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  await Website.findOneAndUpdate(
    { store: storeId },
    { isPublished: true },
    { new: true }
  );

  console.log("[Publish] Site published", {
    userId: String(userId),
    storeId: String(storeId),
    slug: publishedSite.slug,
    version: publishedSite.version,
  });

  return {
    publishedSite: {
      id: publishedSite._id,
      storeId: publishedSite.storeId,
      slug: publishedSite.slug,
      isPublished: publishedSite.isPublished,
      customDomain: publishedSite.customDomain,
      deployedAt: publishedSite.deployedAt,
      version: publishedSite.version,
    },
    liveUrl: `/store/${publishedSite.slug}`,
  };
};

export const updatePublishedSite = async (userId, payload = {}) => {
  const { storeId, customDomain = "" } = payload;

  if (!storeId) {
    throw createError("storeId is required.", 400);
  }

  const publishedSite = await PublishedSite.findOne({ storeId, userId });
  if (!publishedSite) {
    throw createError("Published site not found.", 404);
  }

  publishedSite.customDomain = sanitizeText(customDomain);
  publishedSite.version += 1;
  publishedSite.deployedAt = new Date();
  await publishedSite.save();

  console.log("[Publish] Site updated", {
    userId: String(userId),
    storeId: String(storeId),
    slug: publishedSite.slug,
    version: publishedSite.version,
  });

  return {
    publishedSite: {
      id: publishedSite._id,
      storeId: publishedSite.storeId,
      slug: publishedSite.slug,
      isPublished: publishedSite.isPublished,
      customDomain: publishedSite.customDomain,
      deployedAt: publishedSite.deployedAt,
      version: publishedSite.version,
    },
    liveUrl: `/store/${publishedSite.slug}`,
  };
};

export const unpublishSite = async (userId, storeId) => {
  if (!storeId) {
    throw createError("storeId is required.", 400);
  }

  const publishedSite = await PublishedSite.findOne({ storeId, userId });
  if (!publishedSite) {
    throw createError("Published site not found.", 404);
  }

  await PublishedSite.deleteOne({ _id: publishedSite._id });
  await Website.findOneAndUpdate({ store: storeId }, { isPublished: false }, { new: true });

  console.log("[Publish] Site unpublished", {
    userId: String(userId),
    storeId: String(storeId),
    slug: publishedSite.slug,
  });

  return { message: "Site unpublished successfully." };
};

export const getPublicSiteBySlug = async (slug) => {
  const normalizedSlug = slugify(slug);
  if (!normalizedSlug) {
    throw createError("slug is required.", 400);
  }

  const publishedSite = await PublishedSite.findOne({ slug: normalizedSlug, isPublished: true });
  if (!publishedSite) {
    throw createError("Published site not found.", 404);
  }

  const store = await Store.findOne({ _id: publishedSite.storeId });
  if (!store || !store.isPublished) {
    throw createError("Published site not available.", 404);
  }

  const payload = await buildPublicPayload(store, publishedSite);

  console.log("[Publish] Public access", {
    slug: normalizedSlug,
    storeId: String(store._id),
  });

  return payload;
};
