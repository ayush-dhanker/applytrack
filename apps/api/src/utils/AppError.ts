export class AppError extends Error {
  public code: string;
  public status: number;
  public details?: unknown;

  constructor(code: string, status: number, message: string, details?: unknown) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}