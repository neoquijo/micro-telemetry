/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  microservice, method, Request, Response,
  z, Microservice,
} from 'nats-micro';

import { LoggerFactory } from '../../loggerFactory';
import { request } from '../../microserviceUtils';
import { logger } from 'debug-level/types';
import { brokerInstance } from '../broker';

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
    const log = LoggerFactory.inst.use('ms1');
    log.span('test1');

    await request(brokerInstance, 'ms2', 'test1', 'mockData', log.id);
    res.send('ms1.test2 result');

    log.end();
  }

  // @ts-ignore
  @method<string, string>()
  async test2(req: Request<string>, res: Response<string>): Promise<void> {
    const log = LoggerFactory.inst.use('ms1');
    log.span('test2');

    await request(brokerInstance, 'ms2', 'test2', 'mockData', log.id);
    await request(brokerInstance, 'ms2', 'test2', 'mockData', log.id);
    res.send('ms1.test2 result');

    log.end();
  }
}
