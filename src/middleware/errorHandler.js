export const notFound = (req, res, next) => {
  const error = new Error("Route not found");
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  console.error("[ERROR]", {
    method: req.method,
    url: req.originalUrl,
    message: error.message,
    stack: error.stack,
  });

  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 ? "Internal server error" : error.message || "Error";

  return res.status(statusCode).json({
    success: false,
    message,
  });
};