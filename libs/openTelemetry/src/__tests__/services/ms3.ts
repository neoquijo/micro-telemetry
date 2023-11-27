import {
  microservice, method, Request, Response,
  z,
} from 'nats-micro';

import { extractLogContextFromHeaders } from '../microserviceUtils';
import { LoggerFactory } from '../../loggerFactory';

@microservice({
  name: 'ms3',
  version: '0.0.1',
  description: 'Distributed logging test',
})
export class MS3 {
  // public microservice: Microservice | undefined;

  // @ts-ignore
  @method({
    request: z.string(),
    response: z.void(),
  })
  async test2(req: Request<string>, res: Response<void>) {
    const log = LoggerFactory.inst.use('ms3', extractLogContextFromHeaders(req.headers!)).end();
  }
}
