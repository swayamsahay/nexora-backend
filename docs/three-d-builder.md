# 3D Website Builder

## Endpoints

- `POST /api/3d/save`
- `GET /api/3d/:storeId`
- `PUT /api/3d/update`
- `DELETE /api/3d/:storeId`
- `PUT /api/3d/mode`
- `POST /api/3d/sync`

## Scene Shape

```js
{
  userId,
  storeId,
  builderMode: "normal" | "3d",
  scene: {
    camera: {
      position: [x, y, z],
      rotation: [x, y, z]
    },
    objects: [
      {
        id,
        type: "productCard" | "text3D" | "imagePlane" | "button3D",
        position: [x, y, z],
        rotation: [x, y, z],
        scale: [x, y, z],
        content: {},
        animation: {
          type: "rotate" | "float" | "hover",
          speed: number
        }
      }
    ],
    lighting: {
      type: "ambient" | "directional",
      intensity
    }
  },
  lastUpdated
}
```

## Sync Sources

- `builder` converts BuilderProject sections and optional products into 3D objects.
- `dev` converts DevProject frontend and route metadata into 3D scene objects.
- `ai` converts AIProject generated data into 3D objects.

## Limits

- Maximum 50 objects per scene.
- Scene payload is capped at 1 MB.
- Object content is sanitized before save.
