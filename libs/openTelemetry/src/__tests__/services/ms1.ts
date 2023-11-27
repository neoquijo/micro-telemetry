/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  microservice, method, Request, Response,
  z, Microservice,
} from 'nats-micro';

import { loggerFactory } from '../../loggerFactory';
import { request } from '../microserviceUtils';

const log = loggerFactory.use('ms1');

@microservice({
  name: 'ms1',
  version: '0.0.1',
  description: 'Distributed logging test',
})
export class MS1 {
  public microservice: Microservice | undefined;
  public finished: boolean = false;

  // @ts-ignore
  @method<string, string>()
  async test1(req: Request<string>, res: Response<string>): Promise<void> {
    log.span('test1');

    await request('ms2', 'test1', 'mockData', log.id);
    res.send('ms1.test2 result');

    log.end();
  }

  // @ts-ignore
  @method<string, string>()
  async test2(req: Request<string>, res: Response<string>): Promise<void> {
    log.span('test2');

    await request('ms2', 'test2', 'mockData', log.id);
    await request('ms2', 'test2', 'mockData', log.id);
    res.send('ms1.test2 result');

    log.end();
  }
}
