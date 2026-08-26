export class ApiError extends Error {
  public statusCode: number;
  public errors: any[];
  public success: boolean;

  constructor(statusCode: number, message = "Something went wrong", errors: any[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
    this.success = false;

    Object.setPrototypeOf(this, ApiError.prototype);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
