import type { ErrorRequestHandler } from "express";

const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
	const response = {
		success: false,
		status: err.statusCode,
		message: err.message,
		errors: err.errors?.length > 0 ? err.errors : undefined,
		stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
		timestamp: new Date().toISOString(),
		path: req.originalUrl,
	};

	res.status(err.statusCode).json(response);
};
export default errorHandler;
