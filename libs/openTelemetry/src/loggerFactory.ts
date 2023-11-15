import { Logger } from './logger';
import { OpenTelemetryLogger } from './openTelemetryLogger';

class LoggerFactory {
  private readonly loggerMap: Map<string, Logger> = new Map();

  public use(name: string): Logger {
    if (this.loggerMap.has(name)) {
      return this.loggerMap.get(name)!;
    }

    const openTelemetryLogger = new OpenTelemetryLogger().init(name);
    const logger = new Logger(openTelemetryLogger, openTelemetryLogger.span(name));
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

export const loggerFactory = new LoggerFactory();
