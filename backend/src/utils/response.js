export const sendResponse = (res, statusCode, success, message, data = {}, meta = {}) => {
  return res.status(statusCode).json({
    success,
    message,
    data,
    meta
  });
};
