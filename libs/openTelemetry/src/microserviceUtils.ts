import { SpanContext, isValidSpanId } from '@opentelemetry/api';
import { Broker, RequestOptions } from 'nats-micro';

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

export function createTraceParent(ctx: SpanContext): string {

  const {
    traceId, spanId, traceFlags,
  } = ctx;

  // TODO проверить, нужна ли эта проверка после вызова isValidSpanId
  if (traceId && spanId) {
    const traceFlagsHex = traceFlags.toString(16).padStart(2, '0');
    const traceparentHeader = `${traceId}-${spanId}-${traceFlagsHex}`;
    return traceparentHeader;
  }

  throw new Error('Invalid context');
}

export function extractLogContextFromHeaders(
  headers: Iterable<[string, string]>,
): string | undefined {
  for (const [headerKey, headerValue] of headers) {
    if (headerKey.toLowerCase() === 'traceparent'.toLowerCase()) {
      return headerValue;
    }
  }
  return undefined;
}

export async function request<R, T>(
  broker: Broker,
  service: string,
  method: string,
  data: R,
  traceParent?: string,
  options: Partial<RequestOptions> = {},
): Promise<T | undefined> {

  return (await broker.request<R, T>(
    {
      microservice: service,
      method,
    },
    data,
    {
      ...options,
      headers: [
        ...(
          traceParent
            ? [['traceparent', traceParent]]
            : []
        ) as [string, string][],
      ],
    }
  )).data;
}

