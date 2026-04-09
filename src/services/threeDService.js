import Store from "../models/Store.js";
import Website from "../models/Website.js";
import BuilderProject from "../models/BuilderProject.js";
import DevProject from "../models/DevProject.js";
import AIProject from "../models/AIProject.js";
import ThreeDProject from "../models/ThreeDProject.js";
import { createError } from "../utils/apiResponse.js";

const MAX_OBJECTS = 50;
const MAX_SCENE_BYTES = 1_000_000;

const ALLOWED_OBJECT_TYPES = ["productCard", "text3D", "imagePlane", "button3D"];
const ALLOWED_ANIMATION_TYPES = ["rotate", "float", "hover"];
const ALLOWED_BUILDER_MODES = ["normal", "3d"];

const defaultScene = {
  camera: {
    position: [0, 1.6, 5],
    rotation: [0, 0, 0],
  },
  objects: [],
  lighting: {
    type: "ambient",
    intensity: 1,
  },
};

const toThreeDResponse = (project) => ({
  id: project._id,
  userId: project.userId,
  storeId: project.storeId,
  builderMode: project.builderMode,
  scene: project.scene,
  source: project.source,
  lastUpdated: project.lastUpdated,
  createdAt: project.createdAt,
  updatedAt: project.updatedAt,
});

const ensureStoreOwnership = async (userId, storeId) => {
  const store = await Store.findOne({ _id: storeId, userId });
  if (!store) {
    throw createError("Store not found for this user.", 404);
  }

  return store;
};

const clampNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeVector = (value, fallback) => {
  const base = Array.isArray(fallback) && fallback.length === 3 ? fallback : [0, 0, 0];
  const source = Array.isArray(value) ? value : base;

  return [0, 1, 2].map((index) => clampNumber(source[index], base[index]));
};

const sanitizeText = (value) =>
  String(value || "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/[<>]/g, "")
    .trim();

const sanitizeContent = (value) => {
  if (Array.isArray(value)) {
    return value.map(sanitizeContent);
  }

  if (value && typeof value === "object") {
    const sanitized = {};
    for (const key of Object.keys(value)) {
      if (key.startsWith("$") || key.includes(".")) {
        continue;
      }
      sanitized[key] = sanitizeContent(value[key]);
    }
    return sanitized;
  }

  if (typeof value === "string") {
    return sanitizeText(value);
  }

  return value;
};

const normalizeAnimation = (value) => {
  const input = value && typeof value === "object" ? value : {};
  const type = ALLOWED_ANIMATION_TYPES.includes(input.type) ? input.type : "float";
  const speed = Math.min(Math.max(clampNumber(input.speed, 1), 0), 10);

  return { type, speed };
};

const normalizeObject = (object, index = 0) => {
  const input = object && typeof object === "object" ? object : {};
  const type = ALLOWED_OBJECT_TYPES.includes(input.type) ? input.type : "text3D";

  return {
    id: sanitizeText(input.id || `object-${index + 1}`),
    type,
    position: normalizeVector(input.position, [0, 0, 0]),
    rotation: normalizeVector(input.rotation, [0, 0, 0]),
    scale: normalizeVector(input.scale, [1, 1, 1]),
    content: sanitizeContent(input.content || {}),
    animation: normalizeAnimation(input.animation),
  };
};

const normalizeScene = (scene) => {
  const input = scene && typeof scene === "object" ? scene : {};
  const objects = Array.isArray(input.objects) ? input.objects.slice(0, MAX_OBJECTS) : [];

  return {
    camera: {
      position: normalizeVector(input.camera?.position, defaultScene.camera.position),
      rotation: normalizeVector(input.camera?.rotation, defaultScene.camera.rotation),
    },
    objects: objects.map((object, index) => normalizeObject(object, index)),
    lighting: {
      type: input.lighting?.type === "directional" ? "directional" : "ambient",
      intensity: Math.min(Math.max(clampNumber(input.lighting?.intensity, 1), 0), 10),
    },
  };
};

const sceneByteLength = (scene) => JSON.stringify(scene).length;

const validateScene = (scene) => {
  if (!scene || typeof scene !== "object") {
    throw createError("scene is required.", 400);
  }

  if (!Array.isArray(scene.objects)) {
    throw createError("scene.objects must be an array.", 400);
  }

  if (scene.objects.length > MAX_OBJECTS) {
    throw createError(`Scene exceeds the maximum object limit of ${MAX_OBJECTS}.`, 400);
  }

  if (sceneByteLength(scene) > MAX_SCENE_BYTES) {
    throw createError("Scene exceeds the maximum payload size.", 413);
  }
};

const titleCase = (value) =>
  String(value || "")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

const positionForIndex = (index, columnCount = 4, spacing = 2.5) => {
  const row = Math.floor(index / columnCount);
  const column = index % columnCount;
  return [column * spacing, 1.5, row * -spacing];
};

const buildSectionObjects = (sections = []) =>
  sections.slice(0, MAX_OBJECTS).map((section, index) => ({
    id: `section-${index + 1}`,
    type: "text3D",
    position: positionForIndex(index, 3, 3),
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    content: {
      text: titleCase(section),
      section,
    },
    animation: { type: "float", speed: 0.8 },
  }));

const buildProductObjects = (products = [], startIndex = 0) =>
  products.slice(0, MAX_OBJECTS).map((product, index) => ({
    id: `product-${index + 1}`,
    type: "productCard",
    position: positionForIndex(startIndex + index, 4, 2.8),
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    content: {
      name: sanitizeText(product?.name || "Product"),
      price: clampNumber(product?.price, 0),
      category: sanitizeText(product?.category || "general"),
      image: sanitizeText(product?.image || ""),
      description: sanitizeText(product?.description || ""),
    },
    animation: { type: "hover", speed: 1 },
  }));

const buildTextObjectsFromPages = (pages = [], startIndex = 0) =>
  pages.slice(0, MAX_OBJECTS).map((page, index) => ({
    id: `page-${index + 1}`,
    type: "text3D",
    position: positionForIndex(startIndex + index, 3, 3),
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    content: {
      text: sanitizeText(page?.name || page?.slug || `Page ${index + 1}`),
      path: sanitizeText(page?.slug || page?.path || ""),
    },
    animation: { type: "float", speed: 0.7 },
  }));

const buildButtonObjects = (items = [], startIndex = 0) =>
  items.slice(0, MAX_OBJECTS).map((item, index) => ({
    id: `button-${index + 1}`,
    type: "button3D",
    position: positionForIndex(startIndex + index, 4, 2.5),
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    content: {
      label: sanitizeText(item?.label || item?.name || "Action"),
      href: sanitizeText(item?.href || item?.path || ""),
    },
    animation: { type: "hover", speed: 1 },
  }));

const buildSceneFromParts = ({ sections = [], products = [], pages = [], actions = [], sourceLabel = "Generated Store" }) => {
  const objects = [
    ...buildSectionObjects(sections),
    ...buildProductObjects(products, sections.length),
    ...buildTextObjectsFromPages(pages, sections.length + products.length),
    ...buildButtonObjects(actions, sections.length + products.length + pages.length),
  ].slice(0, MAX_OBJECTS);

  return normalizeScene({
    camera: defaultScene.camera,
    lighting: defaultScene.lighting,
    objects: [
      {
        id: "title-banner",
        type: "text3D",
        position: [0, 3, 0],
        rotation: [0, 0, 0],
        scale: [1.25, 1.25, 1.25],
        content: { text: titleCase(sourceLabel) },
        animation: { type: "float", speed: 0.5 },
      },
      ...objects,
    ],
  });
};

const syncBuilderMode = async (userId, storeId, builderMode) => {
  const normalizedMode = ALLOWED_BUILDER_MODES.includes(builderMode) ? builderMode : "3d";

  await Website.findOneAndUpdate(
    { store: storeId, user: userId },
    { builderMode: normalizedMode },
    { new: true }
  );

  await ThreeDProject.findOneAndUpdate(
    { storeId, userId },
    { builderMode: normalizedMode, lastUpdated: new Date() },
    { new: true }
  );

  console.log(`[3D] Builder mode set to ${normalizedMode} for store ${storeId}`);
};

const upsertThreeDScene = async (userId, storeId, scene, source, builderMode = "3d") => {
  validateScene(scene);

  const project = await ThreeDProject.findOneAndUpdate(
    { userId, storeId },
    {
      userId,
      storeId,
      builderMode: ALLOWED_BUILDER_MODES.includes(builderMode) ? builderMode : "3d",
      scene: normalizeScene(scene),
      source: source || { type: "manual", refId: "" },
      lastUpdated: new Date(),
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  await syncBuilderMode(userId, storeId, project.builderMode);

  console.log(`[3D] Scene saved for store ${storeId}`);
  return toThreeDResponse(project);
};

export const saveThreeDScene = async (userId, payload = {}) => {
  const { storeId, scene, builderMode = "3d", sourceType = "manual", sourceRefId = "" } = payload;

  if (!storeId) {
    throw createError("storeId is required.", 400);
  }

  await ensureStoreOwnership(userId, storeId);

  return upsertThreeDScene(
    userId,
    storeId,
    scene || defaultScene,
    { type: sourceType, refId: sanitizeText(sourceRefId) },
    builderMode
  );
};

export const getThreeDScene = async (userId, storeId) => {
  if (!storeId) {
    throw createError("storeId is required.", 400);
  }

  await ensureStoreOwnership(userId, storeId);

  const project = await ThreeDProject.findOne({ userId, storeId });
  if (!project) {
    throw createError("3D scene not found.", 404);
  }

  return toThreeDResponse(project);
};

export const updateThreeDScene = async (userId, payload = {}) => {
  const { storeId, scene, objectId, objectPatch, builderMode, sourceType, sourceRefId } = payload;

  if (!storeId) {
    throw createError("storeId is required.", 400);
  }

  await ensureStoreOwnership(userId, storeId);

  const project = await ThreeDProject.findOne({ userId, storeId });
  if (!project) {
    throw createError("3D scene not found.", 404);
  }

  let nextScene = normalizeScene(project.scene || defaultScene);

  if (scene && typeof scene === "object") {
    nextScene = normalizeScene(scene);
  }

  if (objectId) {
    const index = nextScene.objects.findIndex((object) => object.id === objectId);
    if (index === -1) {
      throw createError("3D object not found.", 404);
    }

    nextScene.objects[index] = normalizeObject({
      ...nextScene.objects[index],
      ...(objectPatch && typeof objectPatch === "object" ? objectPatch : {}),
    }, index);
    console.log(`[3D] Object updated: ${objectId}`);
  }

  validateScene(nextScene);

  project.scene = nextScene;
  if (builderMode && ALLOWED_BUILDER_MODES.includes(builderMode)) {
    project.builderMode = builderMode;
  }
  if (sourceType) {
    project.source = {
      type: sourceType,
      refId: sanitizeText(sourceRefId || project.source?.refId || ""),
    };
  }
  project.lastUpdated = new Date();

  await project.save();
  await syncBuilderMode(userId, storeId, project.builderMode);

  return toThreeDResponse(project);
};

export const deleteThreeDScene = async (userId, storeId) => {
  if (!storeId) {
    throw createError("storeId is required.", 400);
  }

  await ensureStoreOwnership(userId, storeId);

  const project = await ThreeDProject.findOneAndDelete({ userId, storeId });
  if (!project) {
    throw createError("3D scene not found.", 404);
  }

  await Website.findOneAndUpdate({ user: userId, store: storeId }, { builderMode: "normal" }, { new: true });

  console.log(`[3D] Scene deleted for store ${storeId}`);
  return { message: "3D scene deleted successfully" };
};

export const setThreeDBuilderMode = async (userId, storeId, mode) => {
  if (!storeId) {
    throw createError("storeId is required.", 400);
  }

  if (!ALLOWED_BUILDER_MODES.includes(mode)) {
    throw createError("mode must be normal or 3d.", 400);
  }

  await ensureStoreOwnership(userId, storeId);
  await syncBuilderMode(userId, storeId, mode);

  return { storeId, builderMode: mode };
};

const saveSyncedScene = async (userId, storeId, scene, sourceType, sourceRefId) =>
  upsertThreeDScene(userId, storeId, scene, { type: sourceType, refId: sourceRefId }, "3d");

export const syncThreeDFromBuilderProject = async (userId, storeId) => {
  const builderProject = await BuilderProject.findOne({ userId, storeId });
  if (!builderProject) {
    throw createError("Builder project not found.", 404);
  }

  const scene = buildSceneFromParts({
    sections: builderProject.layout?.sections || [],
    products: builderProject.metadata?.products || [],
    pages: builderProject.pages || [],
    actions: [],
    sourceLabel: builderProject.metadata?.description || "Builder Project",
  });

  return saveSyncedScene(userId, storeId, scene, "builder", String(builderProject._id));
};

export const syncThreeDFromDevProject = async (userId, storeId) => {
  const devProject = await DevProject.findOne({ userId, storeId });
  if (!devProject) {
    throw createError("Dev project not found.", 404);
  }

  const scene = buildSceneFromParts({
    sections: Array.isArray(devProject.frontendCode?.pages)
      ? devProject.frontendCode.pages.map((page) => page.name || page.path || "Page")
      : [],
    products: [],
    pages: devProject.frontendCode?.pages || [],
    actions: (devProject.backendRoutes?.protectedRoutes || []).map((route) => ({
      label: route.description || route.path,
      path: route.path,
    })),
    sourceLabel: "Dev Project",
  });

  return saveSyncedScene(userId, storeId, scene, "dev", String(devProject._id));
};

export const syncThreeDFromAIProject = async (userId, storeId, aiProjectId) => {
  const aiProject = await AIProject.findOne({ _id: aiProjectId, userId });
  if (!aiProject) {
    throw createError("AI project not found.", 404);
  }

  await ensureStoreOwnership(userId, storeId);

  const scene = buildSceneFromParts({
    sections: aiProject.generatedData?.layout?.sections || [],
    products: aiProject.generatedData?.products || [],
    pages: aiProject.generatedData?.pages || [],
    actions: aiProject.generatedData?.features?.map((feature) => ({ label: feature })) || [],
    sourceLabel: aiProject.generatedData?.store?.name || "AI Project",
  });

  return saveSyncedScene(userId, storeId, scene, "ai", String(aiProject._id));
};