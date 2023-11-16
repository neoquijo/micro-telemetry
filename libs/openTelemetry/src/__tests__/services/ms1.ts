import {
  microservice, method, Request, Response,
  z,
  Microservice,
} from 'nats-micro';


import { broker } from './broker';
import { extractLogContextFromHeaders } from '../../logger';
import { loggerFactory } from '../../loggerFactory';



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
    console.log('rere')
    await broker.send({
      microservice: 'ms2',
      method: 'algo'
    },
      'hello1 from ms1',
      {
        headers:
          [['X-LOG-SPAN-ID', JSON.stringify(noseque.id)]]
      });
    await broker.send({
      microservice: 'ms2',
      method: 'algo'
    },
      'hello1 from ms1',
      {
        headers:
          req.headers
      });


    log.end()
    noseque.end()

    this.finished = true;
  };
};
