export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  service?: string;
  requestId?: string;
  data?: unknown;
}

export class Logger {
  private service: string;
  private requestId?: string;

  constructor(service: string, requestId?: string) {
    this.service = service;
    this.requestId = requestId;
  }

  withRequestId(requestId: string): Logger {
    return new Logger(this.service, requestId);
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      service: this.service,
      ...(this.requestId && { requestId: this.requestId }),
      ...(data !== undefined && { data }),
    };
    // Structured JSON logging for CloudWatch
    console.log(JSON.stringify(entry));
  }

  debug(message: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: unknown): void {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, data?: unknown): void {
    this.log(LogLevel.ERROR, message, data);
  }
}
