import { AttributeValue, Attributes, ISpanOptions, SpanContext } from './types';

export interface LogTransport<T> {
  get name(): string;

  endSpan(span: T): void;

  childrenSpan(name: string, father?: T, options?: ISpanOptions): T;
  childrenSpanInId(name: string, parentId: string | undefined): T;

  addSpanAttributes(span: T, attributes: Attributes): void;

  getSpanId(span: T): string;
  getSpanTraceId(span: T): string;
}
