# Nexora AI-Like Integration

The backend now exposes deterministic, free AI-like endpoints that use smart templates and keyword-based logic.

## Endpoints

### Generate Store

`POST /api/ai/generate-store`

Request body:

```json
{
  "prompt": "fashion store for women"
}
```

Response payload:

```json
{
  "storeName": "<generated-store-name>",
  "theme": "fashion",
  "layout": {
    "header": { "title": "<generated-store-name>" },
    "sections": [
      { "type": "hero", "text": "Welcome to <generated-store-name>" },
      { "type": "products", "layout": "grid" },
      { "type": "footer", "text": "© <generated-store-name>" }
    ]
  }
}
```

### Generate Description

`POST /api/ai/generate-description`

Request body:

```json
{
  "name": "Running Shoes",
  "category": "fashion"
}
```

Response payload:

```json
{
  "description": "Upgrade your style with Running Shoes. Designed for comfort, durability, and modern trends."
}
```

### Generate Backend

`POST /api/ai/generate-backend`

Request body:

```json
{
  "prompt": "Create a sneaker ecommerce site"
}
```

Response payload:

```json
{
  "template": "ecommerce",
  "files": [
    {
      "path": "backend/server.js",
      "language": "javascript",
      "content": "import express from \"express\";\n..."
    }
  ]
}
```

### Generate Database

`POST /api/ai/generate-database`

Request body:

```json
{
  "prompt": "Create a sneaker ecommerce site"
}
```

Response payload:

```json
{
  "template": "ecommerce",
  "files": [
    {
      "path": "database/schemas/product.schema.js",
      "language": "javascript",
      "content": "import mongoose from \"mongoose\";\n..."
    }
  ]
}
```

### Generate Full App

`POST /api/ai/generate-app`

The saved AI project now includes a combined project state:

```js
currentProject = {
  files: {
    frontend: [],
    backend: [],
    database: []
  }
}
```

That structure is returned in `generatedData.currentProject` and persisted in `AIProject.generatedData`.

## Frontend Wiring

Use the `generate-store` response to autofill the builder state.

```js
const response = await fetch("/api/ai/generate-store", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ prompt }),
});

const result = await response.json();
const aiStore = result.data;

setBuilderState((current) => ({
  ...current,
  storeName: aiStore.storeName,
  theme: aiStore.theme,
  layout: aiStore.layout,
}));
```

For product forms, call `generate-description` and write the returned description into the textarea or form state.

```js
const response = await fetch("/api/ai/generate-description", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name, category }),
});

const result = await response.json();
setProductState((current) => ({
  ...current,
  description: result.data.description,
}));
```

## Phase 4 UI Shape

The generated project state is intentionally split by tab so a client can render:

* Frontend files for the storefront builder
* Backend files for editable API code
* Database files for editable schema code

Only the frontend preview should be executed. Backend and database files are code artifacts for editing and export.