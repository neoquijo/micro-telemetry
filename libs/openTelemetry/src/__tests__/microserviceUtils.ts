import { SpanContext } from '@opentelemetry/api';
import { RequestOptions } from 'nats-micro';
import { brokerInstance } from './broker';

function parseTraceparent(traceparentHeader: string): SpanContext {
  const [
    traceId, spanId, traceFlagsHex,
  ] = traceparentHeader.split('-');

  if (traceId && spanId && traceFlagsHex) {
    const traceFlags = parseInt(traceFlagsHex, 16);
    return {
      traceId,
      spanId,
      traceFlags,
    };
  }
  throw new Error('Invalid traceparent header format.');

}

export function createTraceparent(ctx: SpanContext): string {
  const {
    traceId, spanId, traceFlags,
  } = ctx;

  if (traceId && spanId) {
    const traceFlagsHex = traceFlags.toString(16).padStart(2, '0');
    const traceparentHeader = `${traceId}-${spanId}-${traceFlagsHex}`;
    return traceparentHeader;
  }
  throw new Error('Invalid context');

}

export function extractLogContextFromHeaders(
  headers: Iterable<[string, string]>,
): SpanContext | undefined {
  for (const [headerKey, headerValue] of headers) {
    if (headerKey.toLowerCase() === 'traceparent'.toLowerCase()) {
      return parseTraceparent(headerValue);
    }
  }
  return undefined;
}

export async function request<R, T>(
  service: string,
  method: string,
  data: R,
  spanContext: SpanContext,
  options: Partial<RequestOptions> = {},
): Promise<T | undefined> {

  return (await brokerInstance.request<R, T>(
    {
      microservice: service,
      method,
    },
    data,
    {
      ...options,
      headers: [
        ['traceparent', createTraceparent(spanContext)],
      ],
    }
  )).data;
}