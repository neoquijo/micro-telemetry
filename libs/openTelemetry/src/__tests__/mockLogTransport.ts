import { Span, SpanContext } from '@opentelemetry/api';
import { LogTransport } from '../logTransport';
import { ISpanOptions } from '../types';

export class SpanCallStack {

}

export class MockLogTransport implements LogTransport {

  public readonly name = 'mock';

  public readonly callStack = new SpanCallStack();

  childrenSpan(name: string, father: Span, fromSpan?: SpanContext | undefined, options?: ISpanOptions | undefined): Span {
    throw new Error('Method not implemented.');
  }

  span(name: string): Span {
    throw new Error('Method not implemented.');
  }
  
  endSpan(span: Span): void {
    throw new Error('Method not implemented.');
  }

  spanFromContext(context: SpanContext): Span | undefined {
    throw new Error('Method not implemented.');
  }
}