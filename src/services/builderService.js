import Store from "../models/Store.js";
import Website from "../models/Website.js";
import BuilderProject from "../models/BuilderProject.js";
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
  builderMode: website.builderMode,
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
  const { storeId, layout, theme, domain, builderMode } = payload;

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
      ...(builderMode ? { builderMode } : {}),
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

const toProjectResponse = (project) => ({
  id: project._id,
  userId: project.userId,
  name: project.name,
  description: project.description,
  type: project.type,
  status: project.status,
  config: project.config,
  metadata: project.metadata,
  tags: project.tags,
  isPublished: project.isPublished,
  createdAt: project.createdAt,
  updatedAt: project.updatedAt,
});

export const createBuilderProject = async (userId, payload) => {
  const { name, description, type, config, metadata, tags } = payload;

  if (!name || !type) {
    throw createError("name and type are required.", 400);
  }

  const project = await BuilderProject.create({
    userId,
    name,
    description: description || "",
    type,
    config: config || {},
    metadata: metadata || {},
    tags: tags || [],
    status: "draft",
    isPublished: false,
  });

  return toProjectResponse(project);
};

export const getBuilderProject = async (userId, projectId) => {
  if (!projectId) {
    throw createError("projectId is required.", 400);
  }

  const project = await BuilderProject.findOne({ _id: projectId, userId });
  if (!project) {
    throw createError("Project not found.", 404);
  }

  return toProjectResponse(project);
};

export const updateBuilderProject = async (userId, projectId, payload) => {
  if (!projectId) {
    throw createError("projectId is required.", 400);
  }

  const updateData = {};
  if (payload.name !== undefined) updateData.name = payload.name;
  if (payload.description !== undefined) updateData.description = payload.description;
  if (payload.config !== undefined) updateData.config = payload.config;
  if (payload.metadata !== undefined) updateData.metadata = payload.metadata;
  if (payload.tags !== undefined) updateData.tags = payload.tags;
  if (payload.status !== undefined) updateData.status = payload.status;

  const project = await BuilderProject.findOneAndUpdate(
    { _id: projectId, userId },
    updateData,
    { new: true }
  );

  if (!project) {
    throw createError("Project not found.", 404);
  }

  return toProjectResponse(project);
};

export const deleteBuilderProject = async (userId, projectId) => {
  if (!projectId) {
    throw createError("projectId is required.", 400);
  }

  const project = await BuilderProject.findOneAndDelete({
    _id: projectId,
    userId,
  });

  if (!project) {
    throw createError("Project not found.", 404);
  }

  return { message: "Project deleted successfully" };
};

export const listBuilderProjects = async (userId, filters = {}) => {
  const query = { userId };
  if (filters.type) query.type = filters.type;
  if (filters.status) query.status = filters.status;
  if (filters.isPublished !== undefined) query.isPublished = filters.isPublished;
  if (Array.isArray(filters.tags) && filters.tags.length > 0) {
    query.tags = { "$in": filters.tags };
  }

  const projects = await BuilderProject.find(query).sort({ createdAt: -1 });
  return projects.map(toProjectResponse);
};

export const publishBuilderProject = async (userId, projectId) => {
  if (!projectId) {
    throw createError("projectId is required.", 400);
  }

  const project = await BuilderProject.findOneAndUpdate(
    { _id: projectId, userId },
    { isPublished: true, status: "published" },
    { new: true }
  );

  if (!project) {
    throw createError("Project not found.", 404);
  }

  return toProjectResponse(project);
};

export const unpublishBuilderProject = async (userId, projectId) => {
  if (!projectId) {
    throw createError("projectId is required.", 400);
  }

  const project = await BuilderProject.findOneAndUpdate(
    { _id: projectId, userId },
    { isPublished: false, status: "draft" },
    { new: true }
  );

  if (!project) {
    throw createError("Project not found.", 404);
  }

  return toProjectResponse(project);
};
