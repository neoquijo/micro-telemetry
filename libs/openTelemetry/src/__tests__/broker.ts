import { SpanContext, isValidSpanId } from '@opentelemetry/api';
import { InMemoryBroker, Headers } from 'nats-micro';

import { createTraceparent } from './mockLogger';

export const brokerInstance = new InMemoryBroker();

export const mockRequest = async (service: string, method: string, ctx?: SpanContext) => {
  const data: { headers?: Headers } = {};
  if (ctx && isValidSpanId(ctx?.spanId))
    data.headers = [
      [
        'traceparent',
        createTraceparent(ctx),
      ],
    ];
  const response = await brokerInstance.request({
    microservice: service,
    method,
  }, 'mockData', {
    ...data,
    timeout: 500,
  });
  console.dir(response);
  return response;
};
