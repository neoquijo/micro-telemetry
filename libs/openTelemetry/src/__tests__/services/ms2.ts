import {
  microservice, method, Request, Response,
  z,
} from 'nats-micro';

import { loggerFactory } from '../../loggerFactory';
import { mockFactory } from '../mockFactory';
import { extractLogContextFromHeaders } from '../mockLogger';

export const log = loggerFactory.use('ms2');

const IRequest = z.object({
  algo: z.string(),
})

type Req = z.infer<typeof IRequest>

@microservice({
  name: 'ms2',
  version: '0.0.1',
  description: 'Distributed logging test',
})
export class MS2 {
  // public microservice: Microservice | undefined;

  @method({
    request: z.string(),
    response: z.string(),
  })
  algo(req: Request<string>, res: Response<string>) {
    const log = mockFactory.use('ms2', extractLogContextFromHeaders(req.headers!));
    log.span('ms2func');
    log.end();
    return 'response from ms2';
  }
}
