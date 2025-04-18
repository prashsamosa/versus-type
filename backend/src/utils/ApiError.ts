class ApiError extends Error {
  public statusCode: number;
  public message: string;
  public errors: Error[];

  constructor(
    statusCode: number,
    message: string = "Internal Server Error",
    errors: Error[] = [],
    stack?: string,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;
