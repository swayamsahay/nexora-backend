/**
 * AI Builder Templates & Rules
 * Predefined configurations for different business categories
 */

export const CATEGORY_KEYWORDS = {
  clothing: ["clothing", "apparel", "fashion", "t-shirt", "dress", "shoes", "wear", "boutique"],
  food: ["food", "restaurant", "cafe", "bakery", "pizza", "burger", "coffee", "catering"],
  tech: ["tech", "electronics", "phone", "gadget", "computer", "software", "app"],
  services: ["service", "salon", "barber", "gym", "training", "consulting", "repair"],
  health: ["health", "doctor", "hospital", "clinic", "wellness", "fitness", "pharmacy"],
  education: ["education", "course", "tutorial", "learning", "school", "academy", "training"],
};

export const THEME_KEYWORDS = {
  modern: ["modern", "clean", "minimal", "sleek", "contemporary"],
  minimal: ["minimal", "simple", "lightweight", "basic"],
  luxury: ["luxury", "premium", "expensive", "exclusive", "high-end"],
  dark: ["dark", "black", "night", "dark mode"],
  vibrant: ["colorful", "vibrant", "bright", "fun", "playful"],
};

export const FEATURE_KEYWORDS = {
  payment: ["payment", "checkout", "buy", "purchase", "transaction"],
  admin: ["admin", "dashboard", "manage", "control", "analytics"],
  booking: ["booking", "appointment", "reserve", "schedule"],
  inventory: ["inventory", "stock", "warehouse", "supplies"],
  shipping: ["shipping", "delivery", "logistics"],
  reviews: ["review", "rating", "feedback", "testimonial"],
  newsletter: ["newsletter", "email", "subscribe", "notification"],
  loyalty: ["loyalty", "rewards", "points", "membership"],
};

export const CATEGORY_TEMPLATES = {
  clothing: {
    theme: "modern",
    sections: ["hero", "featured-collection", "new-arrivals", "sale", "about", "testimonials", "footer"],
    products: [
      { name: "Casual T-Shirt", category: "t-shirts", price: 499 },
      { name: "Denim Jeans", category: "bottoms", price: 1499 },
      { name: "Summer Dress", category: "dresses", price: 1999 },
      { name: "Leather Jacket", category: "outerwear", price: 3499 },
    ],
    pages: ["home", "products", "collection", "checkout", "account"],
    defaultFeatures: ["cart", "payment", "search", "filter", "wishlist"],
  },
  food: {
    theme: "vibrant",
    sections: ["hero", "menu", "specials", "reviews", "order-online", "contact", "footer"],
    products: [
      { name: "Margherita Pizza", category: "pizza", price: 599 },
      { name: "Grilled Chicken Burger", category: "burgers", price: 399 },
      { name: "Caesar Salad", category: "salads", price: 299 },
      { name: "Chocolate Cake", category: "desserts", price: 199 },
    ],
    pages: ["home", "menu", "order", "checkout", "account", "tracking"],
    defaultFeatures: ["cart", "payment", "delivery-tracking", "reviews", "ratings"],
  },
  tech: {
    theme: "dark",
    sections: ["hero", "featured-products", "specifications", "reviews", "compare", "footer"],
    products: [
      { name: "Wireless Headphones", category: "audio", price: 3999 },
      { name: "USB-C Cable", category: "accessories", price: 499 },
      { name: "Phone Stand", category: "accessories", price: 599 },
      { name: "Power Bank 20000mAh", category: "power", price: 1999 },
    ],
    pages: ["home", "products", "specifications", "checkout", "account", "support"],
    defaultFeatures: ["cart", "payment", "compare", "specifications", "reviews"],
  },
  services: {
    theme: "modern",
    sections: ["hero", "services", "pricing", "team", "testimonials", "booking", "footer"],
    products: [
      { name: "Haircut Professional", category: "hair", price: 499 },
      { name: "Full Body Massage", category: "spa", price: 1999 },
      { name: "Personal Training Session", category: "fitness", price: 1499 },
      { name: "Business Consulting", category: "consulting", price: 5000 },
    ],
    pages: ["home", "services", "pricing", "booking", "account"],
    defaultFeatures: ["booking", "calendar", "payment", "reviews", "notifications"],
  },
  health: {
    theme: "minimal",
    sections: ["hero", "services", "doctors", "appointments", "health-tips", "footer"],
    products: [
      { name: "General Checkup", category: "consultation", price: 999 },
      { name: "Blood Test Package", category: "tests", price: 2999 },
      { name: "Dental Cleaning", category: "dental", price: 1499 },
      { name: "Fitness Assessment", category: "wellness", price: 1999 },
    ],
    pages: ["home", "services", "book-appointment", "account", "health-records"],
    defaultFeatures: ["booking", "payment", "reports", "prescription", "notifications"],
  },
  education: {
    theme: "modern",
    sections: ["hero", "courses", "instructors", "testimonials", "enrollment", "footer"],
    products: [
      { name: "Web Development Bootcamp", category: "tech", price: 9999 },
      { name: "Digital Marketing Course", category: "marketing", price: 4999 },
      { name: "Language Learning - Spanish", category: "languages", price: 2999 },
      { name: "Fitness Coaching Program", category: "fitness", price: 3999 },
    ],
    pages: ["home", "courses", "my-courses", "checkout", "account", "progress"],
    defaultFeatures: ["payment", "course-progress", "certificates", "reviews", "forums"],
  },
  other: {
    theme: "modern",
    sections: ["hero", "featured", "about", "contact", "footer"],
    products: [
      { name: "Product 1", category: "general", price: 999 },
      { name: "Product 2", category: "general", price: 1999 },
      { name: "Product 3", category: "general", price: 2999 },
      { name: "Product 4", category: "general", price: 3999 },
    ],
    pages: ["home", "products", "checkout", "account"],
    defaultFeatures: ["cart", "payment", "search"],
  },
};

export const LAYOUT_SECTIONS = {
  hero: {
    name: "Hero Banner",
    description: "Large banner with headline and CTA",
  },
  featured: {
    name: "Featured Products",
    description: "Showcase best-selling items",
  },
  "featured-collection": {
    name: "Featured Collections",
    description: "Multiple product collections",
  },
  "new-arrivals": {
    name: "New Arrivals",
    description: "Latest added products",
  },
  sale: {
    name: "Sale Section",
    description: "Discounted items highlight",
  },
  about: {
    name: "About Section",
    description: "Company/business information",
  },
  testimonials: {
    name: "Testimonials",
    description: "Customer reviews and feedback",
  },
  menu: {
    name: "Menu",
    description: "Food/service menu display",
  },
  "order-online": {
    name: "Online Ordering",
    description: "Place order functionality",
  },
  contact: {
    name: "Contact Section",
    description: "Contact form and information",
  },
  services: {
    name: "Services Listing",
    description: "Available services showcase",
  },
  pricing: {
    name: "Pricing Plans",
    description: "Service/product pricing",
  },
  team: {
    name: "Team Members",
    description: "Staff/team showcase",
  },
  booking: {
    name: "Booking System",
    description: "Appointment/reservation booking",
  },
  specifications: {
    name: "Product Specifications",
    description: "Detailed product info",
  },
  reviews: {
    name: "Reviews Section",
    description: "Customer reviews and ratings",
  },
  compare: {
    name: "Product Compare",
    description: "Compare multiple products",
  },
  footer: {
    name: "Footer",
    description: "Site footer with links",
  },
};

export const THEME_CONFIG = {
  modern: {
    primaryColor: "#0f172a",
    secondaryColor: "#3b82f6",
    accentColor: "#06b6d4",
    fontFamily: "Inter, sans-serif",
  },
  minimal: {
    primaryColor: "#ffffff",
    secondaryColor: "#000000",
    accentColor: "#64748b",
    fontFamily: "Helvetica, Arial, sans-serif",
  },
  luxury: {
    primaryColor: "#1a1a1a",
    secondaryColor: "#d4af37",
    accentColor: "#c0956f",
    fontFamily: "Georgia, serif",
  },
  dark: {
    primaryColor: "#0a0a0a",
    secondaryColor: "#1f1f1f",
    accentColor: "#6366f1",
    fontFamily: "Monaco, monospace",
  },
  vibrant: {
    primaryColor: "#ff6b6b",
    secondaryColor: "#4ecdc4",
    accentColor: "#ffe66d",
    fontFamily: "Poppins, sans-serif",
  },
};

export const DEFAULT_PAGES = ["home", "products", "checkout", "account"];
