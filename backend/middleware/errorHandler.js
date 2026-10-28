/**
 * Centralized error handler middleware.
 * Formats errors into a predictable JSON payload.
 * Prevents stack trace leakage in non-development environments.
 */
function errorHandler(err, req, res, next) {
  // If headers have already been sent, delegate to default Express handler
  if (res.headersSent) {
    return next(err);
  }

  // MongoDB duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      message: `An account or record with this ${field} already exists.`
    });
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      message: messages.join('. ')
    });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Resource not found with the specified id of ${err.value}`
    });
  }

  const statusCode = err.statusCode || res.statusCode !== 200 ? res.statusCode : 500;
  const isDev = process.env.NODE_ENV !== 'production';

  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message);
  if (isDev && err.stack) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error. Please try again later.',
    ...(isDev && { errorDetails: err.stack })
  });
}

module.exports = errorHandler;
