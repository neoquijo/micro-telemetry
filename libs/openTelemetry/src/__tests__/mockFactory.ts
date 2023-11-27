import { SpanContext } from '@opentelemetry/api';

import { MockLogger } from './mockLogger';
import { MockTransport } from './mockTransport';
import { ILogger } from '../logger';

class LoggerFactory {
  private readonly loggerMap: Map<string, MockLogger> = new Map();

  public get instances() {
    return this.loggerMap.size;
  }

  public use(name: string, context?: SpanContext): ILogger | MockLogger {

    if (this.loggerMap.has(name)) {
      return this.loggerMap.get(name)!;
    }

    const openTelemetryLogger = new MockTransport().init(name);
    const span =
      context !== undefined
        ? openTelemetryLogger.spanFromContext(context)!
        : openTelemetryLogger.span(name);

    const logger = new MockLogger(openTelemetryLogger, span);
    this.loggerMap.set(name, logger);
    return context !== undefined ? logger.span(name + 'span') : logger;
  }

  public forget(name: string): void {
    if (this.loggerMap.has(name)) {
      const logger = this.loggerMap.get(name);
      logger?.end();
      this.loggerMap.delete(name);
    }
  }
}

export const mockFactory = new LoggerFactory();
