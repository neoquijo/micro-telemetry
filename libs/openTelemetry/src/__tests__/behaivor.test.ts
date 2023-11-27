import { SpanContext } from '@opentelemetry/api';
import { expect } from 'chai';
import { Microservice, method, microservice, Request, Response, } from 'nats-micro';

import { loggerFactory, transport } from './mockLogs';

import { callStack } from './callStack';
import { brokerInstance } from './broker';
import { mockRequest } from './mockRequest';

import { MS1 } from './services/ms1';
import { MS2 } from './services/ms2';
import { MS3 } from './services/ms3';
import sinon from 'sinon';
import { request } from '../microserviceUtils';

const broker = brokerInstance;

const startSpanSpy = sinon.spy(transport, 'span');
const endSpanSpy = sinon.spy(transport, 'endSpan');

describe('Logger', () => {

  before(async () => {

    const ms1 = new MS1();
    await Microservice.createFromClass(broker, ms1);
    const ms2 = new MS2();
    await Microservice.createFromClass(broker, ms2);
    const ms3 = new MS3();
    await Microservice.createFromClass(broker, ms3);
  });

  afterEach(() => {
    callStack.clear();
    sinon.resetHistory();
  });

  it('simple microservice with one endpoint', async function () {

    @microservice()
    class Test {
      @method<void, string>()
      method1(_req: Request<void>, res: Response<string>): void {
        const log = loggerFactory.use('test');
        const l = log.span('method');
        res.send('method1 result');
        l.end();
      }
    }

    await Microservice.createFromClass(brokerInstance, new Test());

    expect(startSpanSpy.callCount).to.eq(0);
    expect(endSpanSpy.callCount).to.eq(0);

    const response = await request(brokerInstance, 'test', 'method1', '');
    expect(response).to.eq('method1 result');

    expect(startSpanSpy.callCount).to.eq(1);
    expect(startSpanSpy.firstCall.args).to.deep.eq(['method1']);

    expect(endSpanSpy.callCount).to.eq(1);
  });

  // it('2 microservices 4 spans', async function () {
  //   this.timeout(5000);
  //   const response = await mockRequest('ms1', 'test1');

  //   expect(transport.callStack.getSpan('ms1').father).to.eq('ms1');

  //   expect(callStack.getSpan('ms1').father).to.eq('ms1');
  //   expect(callStack.getSpan('ms1func').father).to.eq('ms1');
  //   expect(callStack.getSpan('ms2span').childrens.length).length.to.eq(1);
  //   expect(callStack.getSpan('ms2func').father).to.eq('ms2span');
  //   expect(callStack.map((span) => span).every((span) => span.isOpen === false)).to.be.true;
  //   expect(callStack.spanList.length).to.eq(
  //     mockFactory.instances + callStack.map((span) => span).length,
  //   ); // Кол-во спанов 4 + 2 корневых спана от инстанса
  //   // expect(mockFactory.instances).to.eq(2);

  // });

  it('minimal');

  // it('2 microservices 4 spans2', async () => {
  //   await mockRequest('ms1', 'test1');
  //   expect(callStack.getSpan('ms1').father).to.eq('ms1');
  //   expect(callStack.getSpan('ms1func').father).to.eq('ms1');
  //   expect(callStack.getSpan('ms2span').childrens.length).to.eq(1);
  //   expect(callStack.getSpan('ms2func').father).to.eq('ms2span');
  //   expect(callStack.map((span) => span).every((span) => span.isOpen === false)).to.be.true;
  //   expect(callStack.spanList.length).to.eq(
  //     mockFactory.instances + callStack.map((span) => span).length,
  //   ); // Кол-во спанов 4 + 2 корневых спана от инстанса
  //   expect(mockFactory.instances).to.eq(2);
  //   console.dir(JSON.stringify(callStack.spanTree))
  // });

  // it('context ms1>ms3&&ms2', async () => {
  // await mockRequest('ms1', 'test2');
  // expect(mockFactory.instances).to.eq(3);
  // expect(callStack.getSpan('ms1').father).to.eq('ms1');
  // expect(callStack.getSpan('ms3span').father).to.eq('ms1');
  // expect(callStack.getSpan('ms2span').father).to.eq('ms1');
  // expect(callStack.spanList.length).to.eq(
  //   mockFactory.instances + callStack.map((span) => span).length,
  // );
  // console.log(JSON.stringify(callStack.spanTree));
  // });

});
