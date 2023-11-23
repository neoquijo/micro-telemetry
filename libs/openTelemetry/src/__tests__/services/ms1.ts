/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  microservice, method, Request, Response,
  z,
  Microservice,
} from 'nats-micro';

import { brokerInstance } from './broker';
import { loggerFactory } from '../../loggerFactory';
import { MockLogger, mockLogger } from '../mockLogger';
import { MockTransport } from '../mockTransport';
import { callStack } from '../callStack';

@microservice({
  name: 'ms1',
  version: '0.0.1',
  description: 'Distributed logging test',
})
export class MS1 {
  public microservice: Microservice | undefined;
  public finished: boolean = false;

  // @ts-ignore
  @method({
    request: z.string(),
    response: z.string(),
  })
  async algo(req: Request<string>, res: Response<string>) {

    const transport = new MockTransport().init('ms1');
    console.log('beforeFatherCreate');
    const log = new MockLogger(transport, transport.span('fatherSpan'));
    console.log('after fatherCreate')
    log.span('childrenSpan');
    const log2 = log.span('subsubspan', log.id);
    console.log('afetr subSpan')
    log2.info('subinfo');
    log.end();
    console.log('end')
  };
};
