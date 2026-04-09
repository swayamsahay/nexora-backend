import {
  CATEGORY_KEYWORDS,
  THEME_KEYWORDS,
  FEATURE_KEYWORDS,
  CATEGORY_TEMPLATES,
  LAYOUT_SECTIONS,
  THEME_CONFIG,
  DEFAULT_PAGES,
} from "../utils/aiTemplates.js";
import AIProject from "../models/AIProject.js";

/**
 * AI Builder Service - Rule-based AI logic
 * Handles prompt analysis and business setup generation
 */

/**
 * Parse and validate user prompt
 */
export const parsePrompt = (prompt) => {
  if (!prompt || typeof prompt !== "string") {
    return { valid: false, error: "Invalid prompt" };
  }

  const trimmed = prompt.trim();

  if (trimmed.length < 10) {
    return { valid: false, error: "Prompt must be at least 10 characters" };
  }

  if (trimmed.length > 1000) {
    return { valid: false, error: "Prompt must not exceed 1000 characters" };
  }

  return { valid: true, prompt: trimmed.toLowerCase() };
};

/**
 * Detect business category from prompt
 */
export const detectCategory = (prompt) => {
  const lowerPrompt = prompt.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerPrompt.includes(keyword)) {
        console.log(`[AI Builder] Category detected: ${category} (keyword: ${keyword})`);
        return category;
      }
    }
  }

  console.log(`[AI Builder] No specific category detected, defaulting to 'other'`);
  return "other";
};

/**
 * Detect design theme from prompt
 */
export const detectTheme = (prompt) => {
  const lowerPrompt = prompt.toLowerCase();

  for (const [theme, keywords] of Object.entries(THEME_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerPrompt.includes(keyword)) {
        console.log(`[AI Builder] Theme detected: ${theme} (keyword: ${keyword})`);
        return theme;
      }
    }
  }

  console.log(`[AI Builder] No specific theme detected, defaulting to 'modern'`);
  return "modern";
};

/**
 * Detect required features from prompt
 */
export const detectFeatures = (prompt) => {
  const features = new Set();
  const lowerPrompt = prompt.toLowerCase();

  // Add default features based on category
  const category = detectCategory(prompt);
  const template = CATEGORY_TEMPLATES[category];
  if (template && template.defaultFeatures) {
    template.defaultFeatures.forEach((f) => features.add(f));
  }

  // Add features based on keywords
  for (const [feature, keywords] of Object.entries(FEATURE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerPrompt.includes(keyword)) {
        features.add(feature);
        console.log(`[AI Builder] Feature detected: ${feature} (keyword: ${keyword})`);
      }
    }
  }

  return Array.from(features);
};

/**
 * Generate store configuration
 */
export const generateStoreConfig = (prompt, category, theme) => {
  // Parse store name from prompt
  let storeName = extractStoreName(prompt, category);

  // Generate store description
  const description = generateStoreDescription(category, theme);

  return {
    name: storeName,
    description,
    theme,
    category,
    logo: null,
  };
};

/**
 * Extract or generate store name from prompt
 */
const extractStoreName = (prompt, category) => {
  const words = prompt.split(" ");

  // Try to find quoted store name
  const quotedMatch = prompt.match(/"([^"]+)"/);
  if (quotedMatch) {
    return quotedMatch[1];
  }

  // Look for obvious patterns like "Create a X store"
  const nameMatch = prompt.match(/(?:create|build|make|start|launch).*\b([a-zA-Z ]{2,}?)(?:\s+store|shop|brand|platform)/i);
  if (nameMatch) {
    return titleCase(nameMatch[1].trim());
  }

  // Default to category name + random suffix for uniqueness
  const timestamp = Date.now().toString().slice(-4);
  const templates = {
    clothing: ["Urban Threads", "Style Hub", "Fashion Forward", "Trend Setters"],
    food: ["Taste Haven", "Flavor Fusion", "The Daily Plate", "Culinary Craft"],
    tech: ["Tech Hub", "Gadget Central", "Innovation Store", "Digital Essentials"],
    services: ["Professional Services", "Prime Solutions", "Elite Services", "Expert Hub"],
    health: ["WellnessHub", "Health First", "Vital Care", "Fitness Plus"],
    education: ["Learn Academy", "Knowledge Hub", "EduPlus", "MasterClass"],
  };

  const categoryTemplates = templates[category] || templates.other;
  if (!categoryTemplates) {
    return `Your Store ${timestamp}`;
  }

  const randomTemplate = categoryTemplates[Math.floor(Math.random() * categoryTemplates.length)];
  return randomTemplate;
};

/**
 * Generate store description
 */
const generateStoreDescription = (category, theme) => {
  const descriptions = {
    clothing: "Discover the latest trends in fashion. High-quality apparel for every occasion.",
    food: "Experience culinary excellence with our curated menu of fresh and delicious options.",
    tech: "Browse the latest gadgets and electronics from top brands at unbeatable prices.",
    services: "Professional services tailored to meet your unique needs and expectations.",
    health: "Your trusted partner in health and wellness. Expert care for a better you.",
    education: "Unlock your potential with quality courses and personalized learning experiences.",
    other: "Discover our premium collection of products and services.",
  };

  return descriptions[category] || descriptions.other;
};

/**
 * Generate product templates
 */
export const generateProducts = (category) => {
  const template = CATEGORY_TEMPLATES[category] || CATEGORY_TEMPLATES.other;
  return template.products.map((product) => ({
    ...product,
    description: `${product.name} - Premium quality ${category} item`,
    image: null,
  }));
};

/**
 * Generate layout structure
 */
export const generateLayout = (category) => {
  const template = CATEGORY_TEMPLATES[category] || CATEGORY_TEMPLATES.other;
  return {
    sections: template.sections,
  };
};

/**
 * Generate pages structure
 */
export const generatePages = (category, features) => {
  const template = CATEGORY_TEMPLATES[category] || CATEGORY_TEMPLATES.other;
  const pages = new Set(template.pages);

  // Add pages based on features
  if (features.includes("admin")) {
    pages.add("admin-dashboard");
  }
  if (features.includes("booking")) {
    pages.add("calendar");
  }
  if (features.includes("newsletter")) {
    pages.add("subscribe");
  }

  return Array.from(pages);
};

/**
 * Complete app generation from prompt
 */
export const generateApp = (prompt) => {
  console.log(`[AI Builder] Starting app generation from prompt: "${prompt.substring(0, 50)}..."`);

  // Step 1: Parse and validate
  const parseResult = parsePrompt(prompt);
  if (!parseResult.valid) {
    throw new Error(parseResult.error);
  }

  const parsedPrompt = parseResult.prompt;

  // Step 2: Detect category
  const category = detectCategory(parsedPrompt);

  // Step 3: Detect theme
  const theme = detectTheme(parsedPrompt);

  // Step 4: Detect features
  const features = detectFeatures(parsedPrompt);

  // Step 5: Generate store config
  const store = generateStoreConfig(parsedPrompt, category, theme);

  // Step 6: Generate products
  const products = generateProducts(category);

  // Step 7: Generate layout
  const layout = generateLayout(category);

  // Step 8: Generate pages
  const pages = generatePages(category, features);

  // Step 9: Build final output
  const generatedData = {
    store,
    layout,
    products,
    pages,
    features,
    themeConfig: THEME_CONFIG[theme],
  };

  console.log(`[AI Builder] App generation complete. Category: ${category}, Theme: ${theme}, Features: ${features.length}`);

  return {
    category,
    theme,
    generatedData,
  };
};

/**
 * Save AI project to database
 */
export const saveAIProject = async (userId, prompt, generationResult) => {
  try {
    const project = new AIProject({
      userId,
      prompt,
      detectedCategory: generationResult.category,
      detectedTheme: generationResult.theme,
      generatedData: generationResult.generatedData,
    });

    await project.save();
    console.log(`[AI Builder] Project saved for user ${userId}`);

    return project;
  } catch (error) {
    console.error(`[AI Builder] Error saving project:`, error);
    throw error;
  }
};

/**
 * Get user's AI projects
 */
export const getUserProjects = async (userId, limit = 20, skip = 0) => {
  try {
    const projects = await AIProject.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await AIProject.countDocuments({ userId });

    return {
      projects,
      total,
      limit,
      skip,
    };
  } catch (error) {
    console.error(`[AI Builder] Error fetching projects:`, error);
    throw error;
  }
};

/**
 * Helper: Title case string
 */
const titleCase = (str) => {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};
