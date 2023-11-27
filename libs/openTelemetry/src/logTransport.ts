import { Span, SpanContext } from '@opentelemetry/api';

import { ISpanOptions } from './types';

export interface LogTransport {
  get name(): string;

  span(name: string): Span;
  endSpan(span: Span): void;

  spanFromContext(context: SpanContext): Span | undefined;
  childrenSpan(name: string, father: Span, fromSpan?: SpanContext, options?: ISpanOptions): Span;
}
