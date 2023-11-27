import { SpanContext } from '@opentelemetry/api';

import { Logger } from './logger';
import { OpenTelemetryLogTransport } from './openTelemetryLogger';
import { LogTransport } from './logTransport';

export class LoggerFactory {
  public static inst: LoggerFactory;

  private readonly loggerMap: Map<string, Logger> = new Map();

  public static create(transport: LogTransport): LoggerFactory {
    const inst = new LoggerFactory(transport);
    LoggerFactory.inst = inst;
    return inst;
  }

  public constructor(public readonly transport: LogTransport) {
  }

  public use(name: string, context?: SpanContext): Logger {
    if (this.loggerMap.has(name)) {
      return this.loggerMap.get(name)!;
    }

    this.transport.init(name);
    const span =
      context !== undefined
        ? this.transport.spanFromContext(context)!
        : this.transport.span(name);

    const logger = new Logger(this.transport, span);
    this.loggerMap.set(name, logger);

    return logger;
  }

  public forget(name: string): void {
    if (this.loggerMap.has(name)) {
      const logger = this.loggerMap.get(name);
      logger?.end();
      this.loggerMap.delete(name);
    }
  }
}

