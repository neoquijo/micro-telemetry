import { Attributes, TimeInput } from '@opentelemetry/api';
import { Span } from '@opentelemetry/sdk-trace-node';

export type { AttributeValue, SpanContext, Attributes } from '@opentelemetry/api';

export type Event = {
  name: string,
  attributes?: Attributes,
  startTime?: TimeInput,
};

export interface Ctx {
  traceparent: string,
};

export interface ISpanOptions {
  events: Event[]
  name: string,
  attributes?: Attributes,
};

export interface Propagable {
  span: Span,
  ctx: any,
};