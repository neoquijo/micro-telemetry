import { Span, SpanContext } from '@opentelemetry/api';
import { LogTransport } from '../logTransport';
import { ISpanOptions } from '../types';

export class MockLogTransport implements LogTransport {
  childrenSpan(name: string, father: Span, fromSpan?: SpanContext | undefined, options?: ISpanOptions | undefined): Span {
    throw new Error('Method not implemented.');
  }
  name: any;
  init(name: string): void {
    throw new Error('Method not implemented.');
  }
  span(name: string): Span {
    throw new Error('Method not implemented.');
  }
  spanFromContext(context: SpanContext): Span | undefined {
    throw new Error('Method not implemented.');
  }
}