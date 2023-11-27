import { SpanContext, isValidSpanId } from '@opentelemetry/api';
import { Headers } from 'nats-micro';

import { brokerInstance } from './broker';
import { request } from '../microserviceUtils';

export const mockRequest = async (service: string, method: string, ctx?: SpanContext) => {
  return request(service, method, 'mockData', ctx, { timeout: 500 });
};
