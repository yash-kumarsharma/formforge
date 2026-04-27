const logger = require('../config/logger');

// Custom error class
class AppError extends Error {
    constructor(message, statusCode, code = 'INTERNAL_ERROR') {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

// Error handler middleware
module.exports = (err, req, res, next) => {
    // Default to 500 if no status code
    err.statusCode = err.statusCode || 500;
    err.code = err.code || 'INTERNAL_ERROR';

    // Log the error
    logger.error({
        message: err.message,
        statusCode: err.statusCode,
        code: err.code,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip
    });

    // Determine status code based on error type
    let statusCode = err.statusCode;
    let code = err.code;

    // Handle specific error types
    if (err.name === 'ValidationError') {
        statusCode = 400;
        code = 'VALIDATION_ERROR';
    } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        statusCode = 401;
        code = 'AUTHENTICATION_ERROR';
    } else if (err.message && err.message.includes('unauthorized')) {
        statusCode = 403;
        code = 'FORBIDDEN';
    } else if (err.message && err.message.includes('not found')) {
        statusCode = 404;
        code = 'NOT_FOUND';
    }

    // Send standardized error response
    res.status(statusCode).json({
        success: false,
        error: {
            message: err.message || 'Something went wrong',
            code: code,
            statusCode: statusCode,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
};

// Export AppError for use in other files
module.exports.AppError = AppError;