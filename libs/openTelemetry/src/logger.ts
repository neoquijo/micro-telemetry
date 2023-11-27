import Log from 'debug-level';
import { isUndefined } from 'util';

import { AttributeValue, SpanContext, Attributes } from './types';
import { LogTransport } from './logTransport';

export type { AttributeValue } from '@opentelemetry/api';

export type ILogger = {
  span(text: string, father?: SpanContext, data?: Attributes): ILogger;
  end(): void;
  warn(message: string, data?: Attributes): void;
  silly(message: string, data?: Attributes): void;
  debug(message: string, data?: Attributes): void;
  error(message: string, error?: unknown, data?: Attributes): void;
  info(message: string, data?: Attributes): void;
  verbose(message: string, data?: Attributes): void;
  get id(): string | unknown;
};

export type LogType = 'info' | 'warn' | 'silly' | 'debug' | 'error' | 'verbose';

type ILogType = {
  [K in LogType]: (message: string) => void;
};

export class Logger<T> implements ILogger {

  private _isOpen: boolean = true;
  // eslint-disable-next-line no-use-before-define
  private readonly childrens: Logger<T>[] = [];
  private readonly log: ILogType;

  constructor(
    private readonly transport: LogTransport<T>,
    private readonly _span?: T | string,
  ) {
    this.log = {
      error: new Log(`${this.transport.name}:error`, { level: 'ERROR' }).error,
      info: new Log(`${this.transport.name}:info`, { level: 'INFO' }).info,
      warn: new Log(`${this.transport.name}:warn`, { level: 'WARN' }).warn,
      debug: new Log(`${this.transport.name}:debug`, { level: 'DEBUG' }).debug,
      silly: new Log(`${this.transport.name}:silly`, { level: 'TRACE' }).trace,
      verbose: new Log(`${this.transport.name}:verbose`, { level: 'TRACE' }).trace,
    };
  }

  public get id(): string | undefined {
    if (typeof (this._span) === 'string')
      return this._span;

    return this._span ? this.transport.getSpanId(this._span) : undefined;
  }

  public get isOpen(): boolean {
    return this._isOpen;
  }

  private validateIsOpen() {
    if (!this.isOpen)
      throw new Error('Span is already closed');
  }

  private createTransportSpan(text: string): T {
    return this.transport.childrenSpanInId(text, this.id);
  }

  public span(text: string): ILogger {
    this.validateIsOpen();
    const child = new Logger<T>(this.transport, this.createTransportSpan(text));
    this.childrens.push(child);
    return child;
  }

  public end(): void {
    if (!this._isOpen)
      return;

    if (typeof (this._span) === 'string')
      throw new Error('Cannot close span by it\'s id');

    this.childrens.forEach((children) => children.end());
    if (this._span)
      this.transport.endSpan(this._span);
    this._isOpen = false;
  }

  public addLog(logLevel: LogType, message: string, data: Record<string, AttributeValue>): void {
    this.validateIsOpen();
    const rawMessage = message.replace(/\w+\[\[([^\]]+)\]\]/g, '$1');
    const span = this.createTransportSpan(rawMessage);
    this.transport.addSpanAttributes(span, { level: logLevel });
    this.transport.addSpanAttributes(span, data);
    this.transport.endSpan(span);
    this.log[logLevel](rawMessage);
  }

  public warn(message: string, data: Record<string, AttributeValue> = {}): void {
    this.addLog('warn', message, data);
  }

  public silly(message: string, data: Record<string, AttributeValue> = {}): void {
    this.addLog('silly', message, data);
  }

  public debug(message: string, data: Record<string, AttributeValue> = {}): void {
    this.addLog('debug', message, data);
  }

  public error(message: string, error?: unknown, data: Record<string, AttributeValue> = {}): void {
    this.addLog(
      'error',
      message + (
        isUndefined(error)
          ? ''
          : ('\n' + String(error))
      ),
      {
        error: String(error),
        ...data,
      },
    );
  }

  public info(message: string, data: Record<string, AttributeValue> = {}): void {
    this.addLog('info', message, data);
  }

  public verbose(message: string, data: Record<string, AttributeValue> = {}): void {
    this.addLog('verbose', message, data);
  }
}

export function extractLogContextFromHeaders(headers: Iterable<[string, string]>): SpanContext | undefined {
  for (const [headerKey, headerValue] of headers) {
    if (headerKey.toLowerCase() === 'X-LOG-SPAN-ID'.toLowerCase()) {
      return JSON.parse(headerValue);
    }
  }
  return undefined;
}
