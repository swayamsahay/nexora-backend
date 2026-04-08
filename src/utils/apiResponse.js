export const sendSuccess = (res, statusCode, data, message) => {
  const payload = {
    success: true,
    data,
  };

  if (message) {
    payload.message = message;
  }

  return res.status(statusCode).json(payload);
};

export const createError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};