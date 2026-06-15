const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.statusCode ? err.message : "Something went wrong";
    console.log("Error: ", err);
    res.status(statusCode).json({ error: message });
};

module.exports = errorHandler;