/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  microservice, method, Request, Response,
  z,
} from 'nats-micro';

import { loggerFactory } from '../../loggerFactory';
import { mockFactory } from '../mockFactory';
import { extractLogContextFromHeaders } from '../mockLogger';

const IRequest = z.object({
  algo: z.string(),
});

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
  test1(req: Request<string>, res: Response<string>) {
    const log = mockFactory.use('ms2', extractLogContextFromHeaders(req.headers!));
    log.span('ms2func');
    log.end();
    setTimeout(() => {
      res.send('somme response');
    }, 1000);

  }

  // @ts-ignore
  @method({
    request: z.string(),
    response: z.string(),
  })
  test2(req: Request<string>, res: Response<string>) {
    const log = mockFactory.use('ms2', extractLogContextFromHeaders(req.headers!)).end();
    res.send('algo');
    return 'algo';
  }

}
