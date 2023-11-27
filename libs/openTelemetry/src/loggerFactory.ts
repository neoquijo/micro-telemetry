import { Logger } from './logger';
import { LogTransport } from './logTransport';
import { SpanContext } from './types';

export class LoggerFactory<T> {
  public static inst: LoggerFactory<unknown>;

  private readonly loggerMap: Map<string, Logger<T>> = new Map();

  public static create<T>(transport: LogTransport<T>): LoggerFactory<T> {
    const inst = new LoggerFactory(transport);
    LoggerFactory.inst = inst;
    return inst;
  }

  public constructor(public readonly transport: LogTransport<T>) {
  }

  public use(name: string, context?: SpanContext): Logger<T> {
    if (this.loggerMap.has(name)) {
      return this.loggerMap.get(name)!;
    }

    const span =
      context !== undefined
        ? this.transport.spanFromContext(context)!
        : this.transport.span(name);

    const logger = new Logger<T>(this.transport, span);
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

