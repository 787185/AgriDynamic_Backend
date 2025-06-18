// backend/middleware/errorMiddleware.js

// Middleware to handle 404 Not Found errors
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error); // Pass the error to the next middleware
};

// Middleware to handle general errors
const errorHandler = (err, req, res, next) => {
    // Determine the status code: if response status is 200 (OK), set to 500 (Internal Server Error)
    // Otherwise, use the existing status code
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);

    res.json({
        message: err.message,
        // In development, include the stack trace for debugging
        // In production, you might remove this for security
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = {
    notFound,
    errorHandler,
};