import { createError } from "../utils/apiResponse.js";

const STORE_PREFIXES = ["Elite", "Prime", "Urban", "Modern", "Royal"];
const STORE_SUFFIXES = ["Fashion", "Style", "Trend", "Mart", "Store"];

const THEME_RULES = [
  { theme: "fashion", keywords: ["fashion", "style", "clothing", "apparel", "wear"] },
  { theme: "electronics", keywords: ["tech", "electronics", "gadget", "device", "computer"] },
  { theme: "restaurant", keywords: ["food", "restaurant", "cafe", "meal", "pizza", "burger"] },
];

const DESCRIPTION_TEMPLATES = {
  fashion: (name) =>
    `Upgrade your style with ${name}. Designed for comfort, durability, and modern trends.`,
  electronics: (name) =>
    `Experience next-level performance with ${name}. Built with cutting-edge technology.`,
  food: (name) => `Enjoy the delicious taste of ${name}, made with fresh ingredients.`,
  default: (name) => `Discover ${name}, a thoughtfully crafted product built for everyday use.`,
};

const normalizeText = (value) => String(value || "").trim();

const toLowerText = (value) => normalizeText(value).toLowerCase();

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const countMatches = (text, keyword) => {
  const regex = new RegExp(`\\b${escapeRegExp(keyword.toLowerCase())}\\b`, "g");
  const matches = text.match(regex);
  return matches ? matches.length : 0;
};

const hashText = (text) => {
  let hash = 0;

  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }

  return hash;
};

const pickFromText = (text, options) => {
  const normalized = toLowerText(text);

  const ranked = options
    .map((option, index) => ({
      option,
      index,
      score: countMatches(normalized, option),
    }))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.index - right.index;
    });

  if (ranked[0]?.score > 0) {
    return ranked[0].option;
  }

  return options[hashText(normalized) % options.length] || options[0];
};

const getThemeFromPrompt = (prompt) => {
  const normalized = toLowerText(prompt);

  for (const rule of THEME_RULES) {
    if (rule.keywords.some((keyword) => normalized.includes(keyword))) {
      return rule.theme;
    }
  }

  return "fashion";
};

const buildStoreLayout = (storeName) => ({
  header: { title: storeName },
  sections: [
    { type: "hero", text: `Welcome to ${storeName}` },
    { type: "products", layout: "grid" },
    { type: "footer", text: `© ${storeName}` },
  ],
});

export const detectThemeFromPrompt = (prompt) => getThemeFromPrompt(prompt);

export const generateStoreName = (prompt) => {
  const normalizedPrompt = normalizeText(prompt);
  const prefix = pickFromText(normalizedPrompt, STORE_PREFIXES);
  const suffix = pickFromText(normalizedPrompt, STORE_SUFFIXES);

  return `${prefix} ${suffix} Store`;
};

export const generateStoreTemplate = async (prompt) => {
  const normalizedPrompt = normalizeText(prompt);

  if (!normalizedPrompt) {
    throw createError("prompt is required.", 400);
  }

  const theme = getThemeFromPrompt(normalizedPrompt);
  const storeName = generateStoreName(normalizedPrompt);

  return {
    storeName,
    theme,
    layout: buildStoreLayout(storeName),
  };
};

const resolveDescriptionTemplate = (category) => {
  const normalizedCategory = toLowerText(category);

  if (normalizedCategory.includes("fashion")) {
    return DESCRIPTION_TEMPLATES.fashion;
  }

  if (normalizedCategory.includes("tech") || normalizedCategory.includes("electronic") || normalizedCategory.includes("gadget")) {
    return DESCRIPTION_TEMPLATES.electronics;
  }

  if (normalizedCategory.includes("food") || normalizedCategory.includes("restaurant") || normalizedCategory.includes("cafe")) {
    return DESCRIPTION_TEMPLATES.food;
  }

  return DESCRIPTION_TEMPLATES.default;
};

export const generateProductDescription = async ({ name, category }) => {
  const normalizedName = normalizeText(name);
  const normalizedCategory = normalizeText(category);

  if (!normalizedName) {
    throw createError("name is required.", 400);
  }

  if (!normalizedCategory) {
    throw createError("category is required.", 400);
  }

  const template = resolveDescriptionTemplate(normalizedCategory);

  return {
    description: template(normalizedName),
  };
};