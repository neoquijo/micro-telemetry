import {
  microservice, method, Request, Response,
  z,
  Microservice,
} from 'nats-micro';
import { extractLogContextFromHeaders, loggerFactory } from 'logs';

import { broker } from './broker';

const log = loggerFactory.use('ms1');

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
    const noseque = log.span('algo', extractLogContextFromHeaders(req.headers));
    noseque.info('1')
    await broker.send({ microservice: 'ms2', method: 'algo' }, 'hello1 from ms1', { headers: [['X-LOG-SPAN-ID', JSON.stringify(noseque.id)]] });
    noseque.info('2')
    await broker.send({ microservice: 'ms2', method: 'algo' }, 'hello2 from ms1', { headers: [['X-LOG-SPAN-ID', JSON.stringify(noseque.id)]] });
    noseque.info('3')
    log.end()
    res.send('algo');
    this.finished = true;
  };
};
