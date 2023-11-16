import {
  microservice, method, Request, Response,
  z,
  Microservice,
} from 'nats-micro';
import { extractLogContextFromHeaders, loggerFactory } from 'logs';

import { broker } from './broker';



@microservice({
  name: 'ms1',
  version: '0.0.1',
  description: 'Distributed logging test',
})
export class MS1 {
  public microservice: Microservice | undefined;
  public finished: boolean = false;

  @method({
    request: z.string(),
    response: z.string(),
  })
  async algo(req: Request<string>, res: Response<string>) {
    const log = loggerFactory.use('ms1');
    const noseque = log.span('ms1', extractLogContextFromHeaders(req.headers));
    await broker.send({
      microservice: 'ms2',
      method: 'algo'
    },
      'hello1 from ms1',
      {
        headers:
          [['X-LOG-SPAN-ID', req.headers[0][1]]]
      });
    log.span('ms1', extractLogContextFromHeaders(req.headers)).end()
    noseque.end()

    this.finished = true;
  };
};
