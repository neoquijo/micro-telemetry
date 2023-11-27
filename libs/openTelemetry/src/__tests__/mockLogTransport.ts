import { LogTransport } from '../logTransport';

import type { Attributes, ISpanOptions, SpanContext } from '../types';

export class SpanCallStack {

}

export type MockSpan = {
  // id: string;
  // isOpen: boolean;
  // children: MockSpan[];
  // attributes: Attributes;
};

export class MockLogTransport implements LogTransport<MockSpan> {
  public readonly name = 'mock';

  public readonly callStack = new SpanCallStack();

  childrenSpan(name: string, father: MockSpan, fromSpan?: SpanContext | undefined, options?: ISpanOptions | undefined): MockSpan {
    return {};
  }

  span(name: string): MockSpan {
    return {};
  }

  endSpan(span: MockSpan): void {
  }

  spanFromContext(context: SpanContext): MockSpan | undefined {
    return {};
  }

  addSpanAttributes(span: MockSpan, attributes: Attributes): void {
    // span.attributes = { ...span.attributes, ...attributes };
  }

  getSpanId(span: MockSpan): string {
    return '';
  }
}