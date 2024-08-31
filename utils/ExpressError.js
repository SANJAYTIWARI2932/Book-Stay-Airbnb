class ExpressError extends Error {
    constructor(statusCode, message) {
        super();
        this.statusCode = statusCode || 500; // Set default status code to 500 if not provided
        this.message = message || 'Internal Server Error'; // Set default message if not provided
    }
}

module.exports = ExpressError;
