/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  microservice, method, Request, Response,
  z,
  Microservice,
  InMemoryBroker,
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
  private readonly broker = new InMemoryBroker();
  // @ts-ignore
  @method({
    request: z.string(),
    response: z.string(),
  })
  async algo(req: Request<string>, res: Response<string>) {

    const transport = new MockTransport().init('ms1');
    const transport2 = new MockTransport().init('ms2');
    const log = new MockLogger(transport, transport.span('fatherSpan'));
    const children = log.span('childrenSpan');
    const log2 = log.span('createdFromChildren', children.id);
    const subsubSpan = log2.span('subsubsubspan');
    subsubSpan.end();
    log.span('children of ms1');
    const ms2 = new MockLogger(transport2, transport.span('ms2')).span('ms2', log.id);
    ms2.info('algo');
    ms2.end();
    log.end();
    // const log2 = log.span('subsubspan', log.id);
    // log2.span('subinfo');
    // log.end();

    this.broker.request({ microservice: 'ms2' })
  };
};
