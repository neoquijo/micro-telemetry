// import { AttributeValue, Span, SpanContext } from '@opentelemetry/api';
// import Log from 'debug-level';
// import { isUndefined } from 'util';

// // import { callStack } from './callStack';
// import { callStack } from './callStack';
// import { SpanOptions } from '../types';
// import { LogTransport } from '../logTransport';

// export type { AttributeValue } from '@opentelemetry/api';

// export type ILogger = {
//   span(text: string, father?: SpanContext, data?: SpanOptions): ILogger;
//   end(): void;
//   warn(message: string, data?: SpanOptions): void;
//   silly(message: string, data?: SpanOptions): void;
//   debug(message: string, data?: SpanOptions): void;
//   error(message: string, error?: unknown, data?: SpanOptions): void;
//   info(message: string, data?: SpanOptions): void;
//   verbose(message: string, data?: SpanOptions): void;
//   get id(): SpanContext;
// };

// export type LogType = 'info' | 'warn' | 'silly' | 'debug' | 'error' | 'verbose';

// type ILogType = {
//   [K in LogType]: (message: string) => void;
// };

// export class MockLogger implements ILogger {

//   private _isOpen: boolean = true;
//   // eslint-disable-next-line no-use-before-define
//   private readonly childrens: MockLogger[] = [];
//   private readonly log: ILogType;
//   constructor(
//     private readonly transport: LogTransport,
//     private readonly _span: Span,
//   ) {
//     this.log = {
//       error: new Log(`${this.transport.name}:error`, { level: 'ERROR' }).error,
//       info: new Log(`${this.transport.name}:info`, { level: 'INFO' }).info,
//       warn: new Log(`${this.transport.name}:warn`, { level: 'WARN' }).warn,
//       debug: new Log(`${this.transport.name}:debug`, { level: 'DEBUG' }).debug,
//       silly: new Log(`${this.transport.name}:silly`, { level: 'TRACE' }).trace,
//       verbose: new Log(`${this.transport.name}:verbose`, { level: 'TRACE' }).trace,
//     };
//   }

//   public get id() {
//     return this._span.spanContext();
//   }

//   public get isOpen(): boolean {
//     return this._isOpen;
//   }

//   private validateIsOpen() {
//     if (!this.isOpen)
//       throw new Error('Span is already closed');
//   }

//   public span(text: string, father?: SpanContext): ILogger {
//     this.validateIsOpen();
//     const span = new MockLogger(
//       this.transport,
//       this.transport.childrenSpan(text, this._span, father),
//     );
//     this.childrens.push(span);
//     return span;

//   }

//   public end(): void {
//     this.childrens.forEach((children) => children.end());
//     this._span?.end();
//     callStack.closeSpan(this._span.spanContext().spanId);
//     // callStack.closeSpan(this._span.spanContext().spanId);
//     this._isOpen = false;
//   }

//   public addLog(logLevel: LogType, message: string, data: Record<string, AttributeValue>): void {
//     this.validateIsOpen();
//     const rawMessage = message.replace(/\w+\[\[([^\]]+)\]\]/g, '$1');
//     const span = this.transport.childrenSpan(rawMessage, this._span);
//     span.setAttribute('level', logLevel);
//     span.setAttributes(data);
//     span.end();
//     this.log[logLevel](rawMessage);
//   }

//   public warn(message: string, data: Record<string, AttributeValue> = {}): void {
//     this.addLog('warn', message, data);
//   }

//   public silly(message: string, data: Record<string, AttributeValue> = {}): void {
//     this.addLog('silly', message, data);
//   }

//   public debug(message: string, data: Record<string, AttributeValue> = {}): void {
//     this.addLog('debug', message, data);
//   }

//   public error(message: string, error?: unknown, data: Record<string, AttributeValue> = {}): void {
//     this.addLog(
//       'error',
//       message + (
//         isUndefined(error)
//           ? ''
//           : ('\n' + String(error))
//       ),
//       {
//         error: String(error),
//         ...data,
//       },
//     );
//   }

//   public info(message: string, data: Record<string, AttributeValue> = {}): void {
//     this.addLog('info', message, data);
//   }

//   public verbose(message: string, data: Record<string, AttributeValue> = {}): void {
//     this.addLog('verbose', message, data);
//   }
// }
