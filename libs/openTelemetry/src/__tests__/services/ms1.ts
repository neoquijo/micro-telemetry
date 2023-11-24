/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  microservice, method, Request, Response,
  z,
  Microservice,
} from 'nats-micro';

import { brokerInstance } from './broker';
import { mockFactory } from '../mockFactory';
import { createTraceparent } from '../mockLogger';

@microservice({
  name: 'ms1',
  version: '0.0.1',
  description: 'Distributed logging test',
})
export class MS1 {
  public microservice: Microservice | undefined;
  public finished: boolean = false;
  public readonly broker = brokerInstance;
  // @ts-ignore
  @method({
    request: z.string(),
    response: z.string(),
  })
  async algo(req: Request<string>, res: Response<string>) {

    const log = mockFactory.use('ms1');
    log.span('ms1func');

    this.broker.send({
      microservice: 'ms2',
      method: 'algo',
    }, 'somme', {
      headers: [
        [
          'traceparent',
          createTraceparent(log.id),
        ],
      ],
    });
    log.end();
  }
}
