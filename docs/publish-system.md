# Publish System

## Endpoints

- `POST /api/publish`
- `GET /api/public/:slug`
- `PUT /api/publish/update`
- `DELETE /api/publish/:storeId`

## Behavior

- Publishes a store into a `PublishedSite` record.
- Reuses the store slug as the public URL base.
- Generates a unique slug if a collision exists.
- Increments version on republish/update.
- Keeps the public payload read-only and strips sensitive owner data.

## Public Payload

The public loader combines:

- `Store`
- `Product`
- `Website`
- `BuilderProject`
- `ThreeDProject`
- `DevProject`

The response is safe for public consumption and includes the storefront layout, products, and 3D scene if present.

## Notes

- `Website.builderMode` stores the normal vs 3D toggle.
- Public URLs are served from the slug-based route: `/api/public/:slug`.
- The system is ready for a CDN/static snapshot layer later.
