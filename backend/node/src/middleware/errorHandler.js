const errorHandler = (err, req, res, next) => {
  console.error('[Error]', err.stack || err.message);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const field = Object.keys(err.errors)[0];
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: err.errors[field].message, field }
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      error: { code: 'DUPLICATE_KEY', message: `${field} already exists.`, field }
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'Invalid token.' } });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: { code: 'TOKEN_EXPIRED', message: 'Token expired.' } });
  }

  // Default
  return res.status(err.status || 500).json({
    error: {
      code: err.code || 'SERVER_ERROR',
      message: err.message || 'An internal server error occurred.',
    }
  });
};

export default errorHandler;
