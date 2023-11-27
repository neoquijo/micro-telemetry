import {
  microservice, method, Request, Response,
  z,
} from 'nats-micro';

import { mockFactory } from '../mockFactory';
import { extractLogContextFromHeaders } from '../mockLogger';

@microservice({
  name: 'ms3',
  version: '0.0.1',
  description: 'Distributed logging test',
})
export class MS3 {
  // public microservice: Microservice | undefined;

  @method({
    request: z.string(),
    response: z.void(),
  })
  async test2(req: Request<string>, res: Response<void>) {
    const log = mockFactory.use('ms3', extractLogContextFromHeaders(req.headers!)).end();
  }
}
