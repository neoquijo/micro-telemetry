import { Span, SpanContext } from '@opentelemetry/api';

import { ISpanOptions } from './types';

export interface LogTransport {
  readonly name: any;

  init(name: string): void;

  span(name: string): Span;
  spanFromContext(context: SpanContext): Span | undefined;

  childrenSpan(name: string, father: Span, fromSpan?: SpanContext, options?: ISpanOptions): Span;
}
