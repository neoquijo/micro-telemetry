import { AttributeValue, Attributes, ISpanOptions, SpanContext } from './types';

export interface LogTransport<T> {
  get name(): string;

  span(name: string): T;
  endSpan(span: T): void;

  spanFromContext(context: SpanContext): T | undefined;
  childrenSpan(name: string, father: T, fromSpan?: SpanContext, options?: ISpanOptions): T;

  addSpanAttributes(span: T, attributes: Attributes): void;

  getSpanId(span: T): string;
}
