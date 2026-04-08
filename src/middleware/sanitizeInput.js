const sanitizeValue = (value) => {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === "object") {
    const sanitizedObject = {};

    Object.keys(value).forEach((key) => {
      // Remove risky Mongo-style operators and dotted keys.
      if (key.startsWith("$") || key.includes(".")) {
        return;
      }

      sanitizedObject[key] = sanitizeValue(value[key]);
    });

    return sanitizedObject;
  }

  if (typeof value === "string") {
    return value.trim();
  }

  return value;
};

const applySanitizedObject = (target, sanitized) => {
  if (!target || typeof target !== "object" || Array.isArray(target)) {
    return;
  }

  Object.keys(target).forEach((key) => {
    delete target[key];
  });

  if (!sanitized || typeof sanitized !== "object" || Array.isArray(sanitized)) {
    return;
  }

  Object.assign(target, sanitized);
};

export const sanitizeInput = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }

  if (req.query) {
    applySanitizedObject(req.query, sanitizeValue(req.query));
  }

  if (req.params) {
    applySanitizedObject(req.params, sanitizeValue(req.params));
  }

  next();
};