import { createError } from "../utils/apiResponse.js";
import { generateApp } from "./aiBuilderService.js";

const normalizePrompt = (prompt) => String(prompt || "").trim().toLowerCase();

const slugify = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const pascalCase = (value) =>
  String(value || "")
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");

const titleCase = (value) =>
  String(value || "")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

const createFile = (path, language, content) => ({
  path,
  language,
  content,
});

const validateFiles = (files, scope) => {
  if (!Array.isArray(files) || files.length === 0) {
    throw createError(`${scope} generator produced no files.`, 400);
  }

  for (const file of files) {
    if (!file.path || !file.content) {
      throw createError(`${scope} generator produced an invalid file entry.`, 400);
    }
  }
};

const detectTemplateType = (prompt) => {
  const text = normalizePrompt(prompt);
  const blogKeywords = ["blog", "article", "articles", "post", "posts", "content", "news", "journal", "comment", "comments"];
  const ecommerceKeywords = ["ecommerce", "e-commerce", "store", "shop", "sneaker", "sneakers", "product", "products", "marketplace"];

  if (blogKeywords.some((keyword) => text.includes(keyword))) {
    return "blog";
  }

  if (ecommerceKeywords.some((keyword) => text.includes(keyword))) {
    return "ecommerce";
  }

  return "ecommerce";
};

const buildFrontendFiles = (project) => {
  const storeName = titleCase(project.generatedData.store.name || "Generated Store");
  const pageNames = Array.isArray(project.generatedData.pages) ? project.generatedData.pages : [];
  const primaryPage = pageNames[0] || "home";
  const sectionMarkup = (project.generatedData.layout.sections || [])
    .map((section) => `<section className=\"section section--${section}\">${titleCase(section)}</section>`)
    .join("\n        ");

  return [
    createFile(
      "frontend/src/App.jsx",
      "jsx",
      `import HomePage from "./pages/HomePage.jsx";

export default function App() {
  return <HomePage />;
}`
    ),
    createFile(
      "frontend/src/pages/HomePage.jsx",
      "jsx",
      `const sections = ${JSON.stringify(project.generatedData.layout.sections, null, 2)};

export default function HomePage() {
  return (
    <main className=\"storefront\">
      <header className=\"storefront__hero\">
        <h1>${storeName}</h1>
        <p>Generated ${project.category} storefront for ${primaryPage}.</p>
      </header>
      <div className=\"storefront__sections\">${sectionMarkup ? `
        ${sectionMarkup}
      ` : ""}
      </div>
      <pre className=\"storefront__debug\">{JSON.stringify(sections, null, 2)}</pre>
    </main>
  );
}`
    ),
    createFile(
      "frontend/src/components/ProductCard.jsx",
      "jsx",
      `export default function ProductCard({ product }) {
  return (
    <article className=\"product-card\">
      <img src={product.image || \"/placeholder.png\"} alt={product.name} />
      <h3>{product.name}</h3>
      <p>{product.category}</p>
      <strong>${"${"}product.price${"}"}</strong>
    </article>
  );
}`
    ),
    createFile(
      "frontend/src/styles/theme.css",
      "css",
      `:root {
  --color-primary: ${project.generatedData.themeConfig?.primaryColor || "#0f172a"};
  --color-secondary: ${project.generatedData.themeConfig?.secondaryColor || "#3b82f6"};
  --color-accent: ${project.generatedData.themeConfig?.accentColor || "#06b6d4"};
  --font-family: ${project.generatedData.themeConfig?.fontFamily || "Inter, sans-serif"};
}`
    ),
  ];
};

const buildEcommerceBackendFiles = (project) => {
  const resourceName = pascalCase(project.generatedData.store.name || "Product Store");

  return [
    createFile(
      "backend/server.js",
      "javascript",
      `import express from "express";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";

const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ success: true, message: "${resourceName} backend ready" });
});

app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  res.status(status).json({ success: false, message: error.message || "Server error" });
});

export default app;`
    ),
    createFile(
      "backend/routes/product.routes.js",
      "javascript",
      `import { Router } from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;`
    ),
    createFile(
      "backend/routes/order.routes.js",
      "javascript",
      `import { Router } from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} from "../controllers/order.controller.js";

const router = Router();

router.get("/", getOrders);
router.get("/:id", getOrderById);
router.post("/", createOrder);
router.put("/:id", updateOrder);
router.delete("/:id", deleteOrder);

export default router;`
    ),
    createFile(
      "backend/controllers/product.controller.js",
      "javascript",
      `const products = [];

export const getProducts = async (req, res) => {
  res.json({ success: true, data: products });
};

export const getProductById = async (req, res) => {
  const product = products.find((item) => item.id === req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }
  res.json({ success: true, data: product });
};

export const createProduct = async (req, res) => {
  const product = { id: Date.now().toString(), ...req.body };
  products.push(product);
  res.status(201).json({ success: true, data: product });
};

export const updateProduct = async (req, res) => {
  const index = products.findIndex((item) => item.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }
  products[index] = { ...products[index], ...req.body };
  res.json({ success: true, data: products[index] });
};

export const deleteProduct = async (req, res) => {
  const index = products.findIndex((item) => item.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }
  const removed = products.splice(index, 1)[0];
  res.json({ success: true, data: removed });
};`
    ),
    createFile(
      "backend/controllers/order.controller.js",
      "javascript",
      `const orders = [];

export const getOrders = async (req, res) => {
  res.json({ success: true, data: orders });
};

export const getOrderById = async (req, res) => {
  const order = orders.find((item) => item.id === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }
  res.json({ success: true, data: order });
};

export const createOrder = async (req, res) => {
  const order = { id: Date.now().toString(), status: "pending", ...req.body };
  orders.push(order);
  res.status(201).json({ success: true, data: order });
};

export const updateOrder = async (req, res) => {
  const index = orders.findIndex((item) => item.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }
  orders[index] = { ...orders[index], ...req.body };
  res.json({ success: true, data: orders[index] });
};

export const deleteOrder = async (req, res) => {
  const index = orders.findIndex((item) => item.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }
  const removed = orders.splice(index, 1)[0];
  res.json({ success: true, data: removed });
};`
    ),
    createFile(
      "backend/models/Product.js",
      "javascript",
      `import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: "" },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);`
    ),
    createFile(
      "backend/models/Order.js",
      "javascript",
      `import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true, default: 1 },
      },
    ],
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "paid", "processing", "shipped", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);`
    ),
  ];
};

const buildBlogBackendFiles = (project) => {
  const resourceName = pascalCase(project.generatedData.store.name || "Blog");

  return [
    createFile(
      "backend/server.js",
      "javascript",
      `import express from "express";
import postRoutes from "./routes/post.routes.js";
import commentRoutes from "./routes/comment.routes.js";

const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ success: true, message: "${resourceName} backend ready" });
});

app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);

app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  res.status(status).json({ success: false, message: error.message || "Server error" });
});

export default app;`
    ),
    createFile(
      "backend/routes/post.routes.js",
      "javascript",
      `import { Router } from "express";
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
} from "../controllers/post.controller.js";

const router = Router();

router.get("/", getPosts);
router.get("/:id", getPostById);
router.post("/", createPost);
router.put("/:id", updatePost);
router.delete("/:id", deletePost);

export default router;`
    ),
    createFile(
      "backend/routes/comment.routes.js",
      "javascript",
      `import { Router } from "express";
import {
  createComment,
  getComments,
  deleteComment,
} from "../controllers/comment.controller.js";

const router = Router();

router.get("/", getComments);
router.post("/", createComment);
router.delete("/:id", deleteComment);

export default router;`
    ),
    createFile(
      "backend/controllers/post.controller.js",
      "javascript",
      `const posts = [];

export const getPosts = async (req, res) => {
  res.json({ success: true, data: posts });
};

export const getPostById = async (req, res) => {
  const post = posts.find((item) => item.id === req.params.id);
  if (!post) {
    return res.status(404).json({ success: false, message: "Post not found" });
  }
  res.json({ success: true, data: post });
};

export const createPost = async (req, res) => {
  const post = { id: Date.now().toString(), ...req.body }; 
  posts.push(post);
  res.status(201).json({ success: true, data: post });
};

export const updatePost = async (req, res) => {
  const index = posts.findIndex((item) => item.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Post not found" });
  }
  posts[index] = { ...posts[index], ...req.body };
  res.json({ success: true, data: posts[index] });
};

export const deletePost = async (req, res) => {
  const index = posts.findIndex((item) => item.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Post not found" });
  }
  const removed = posts.splice(index, 1)[0];
  res.json({ success: true, data: removed });
};`
    ),
    createFile(
      "backend/controllers/comment.controller.js",
      "javascript",
      `const comments = [];

export const getComments = async (req, res) => {
  res.json({ success: true, data: comments });
};

export const createComment = async (req, res) => {
  const comment = { id: Date.now().toString(), ...req.body };
  comments.push(comment);
  res.status(201).json({ success: true, data: comment });
};

export const deleteComment = async (req, res) => {
  const index = comments.findIndex((item) => item.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Comment not found" });
  }
  const removed = comments.splice(index, 1)[0];
  res.json({ success: true, data: removed });
};`
    ),
    createFile(
      "backend/models/Post.js",
      "javascript",
      `import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true },
    excerpt: { type: String, default: "" },
    content: { type: String, required: true },
    image: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);`
    ),
    createFile(
      "backend/models/Comment.js",
      "javascript",
      `import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    author: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Comment", commentSchema);`
    ),
  ];
};

const buildEcommerceDatabaseFiles = (project) => [
  createFile(
    "database/schemas/product.schema.js",
    "javascript",
    `import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: "" },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

export default productSchema;`
  ),
  createFile(
    "database/schemas/order.schema.js",
    "javascript",
    `import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true, default: 1 },
      },
    ],
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "paid", "processing", "shipped", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default orderSchema;`
  ),
];

const buildBlogDatabaseFiles = () => [
  createFile(
    "database/schemas/post.schema.js",
    "javascript",
    `import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true },
    excerpt: { type: String, default: "" },
    content: { type: String, required: true },
    image: { type: String, default: "" },
  },
  { timestamps: true }
);

export default postSchema;`
  ),
  createFile(
    "database/schemas/comment.schema.js",
    "javascript",
    `import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    author: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default commentSchema;`
  ),
];

const composeProjectState = (frontendFiles, backendFiles, databaseFiles) => ({
  files: {
    frontend: frontendFiles,
    backend: backendFiles,
    database: databaseFiles,
  },
});

const buildGeneratedData = (baseProject, backendFiles, databaseFiles, frontendFiles) => ({
  ...baseProject.generatedData,
  backend: {
    template: baseProject.templateType,
    files: backendFiles,
  },
  database: {
    template: baseProject.templateType,
    files: databaseFiles,
  },
  currentProject: composeProjectState(frontendFiles, backendFiles, databaseFiles),
});

export const generateBackendProject = (prompt) => {
  const validation = String(prompt || "").trim();
  if (!validation) {
    throw createError("prompt is required.", 400);
  }

  const baseProject = generateApp(prompt);
  const templateType = detectTemplateType(prompt);
  const backendFiles = templateType === "blog" ? buildBlogBackendFiles(baseProject) : buildEcommerceBackendFiles(baseProject);

  validateFiles(backendFiles, "Backend");

  return {
    template: templateType,
    files: backendFiles,
  };
};

export const generateDatabaseProject = (prompt) => {
  const validation = String(prompt || "").trim();
  if (!validation) {
    throw createError("prompt is required.", 400);
  }

  const baseProject = generateApp(prompt);
  const templateType = detectTemplateType(prompt);
  const databaseFiles = templateType === "blog" ? buildBlogDatabaseFiles(baseProject) : buildEcommerceDatabaseFiles(baseProject);

  validateFiles(databaseFiles, "Database");

  return {
    template: templateType,
    files: databaseFiles,
  };
};

export const generatePhase4Project = (prompt) => {
  const validation = String(prompt || "").trim();
  if (!validation) {
    throw createError("prompt is required.", 400);
  }

  const baseProject = generateApp(prompt);
  const templateType = detectTemplateType(prompt);
  const backendFiles = templateType === "blog" ? buildBlogBackendFiles(baseProject) : buildEcommerceBackendFiles(baseProject);
  const databaseFiles = templateType === "blog" ? buildBlogDatabaseFiles(baseProject) : buildEcommerceDatabaseFiles(baseProject);
  const frontendFiles = buildFrontendFiles(baseProject);

  validateFiles(frontendFiles, "Frontend");
  validateFiles(backendFiles, "Backend");
  validateFiles(databaseFiles, "Database");

  return {
    category: baseProject.category,
    theme: baseProject.theme,
    template: templateType,
    generatedData: buildGeneratedData(baseProject, backendFiles, databaseFiles, frontendFiles),
  };
};
