export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (error, req, res, next) => {
  console.error("[ERROR]", {
    method: req.method,
    url: req.originalUrl,
    message: error.message,
    stack: error.stack,
  });

  const statusCode = error.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message: error.message || "Internal server error",
  });
};