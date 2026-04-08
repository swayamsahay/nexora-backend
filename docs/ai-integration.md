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