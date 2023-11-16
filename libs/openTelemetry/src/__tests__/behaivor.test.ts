import { expect } from 'chai';
import sinon, { SinonStub } from 'sinon';
import { InMemoryBroker, Microservice } from 'nats-micro'
// import { Logger } from '../logger';
import { LogType } from '../logger';
import { loggerFactory } from '../loggerFactory';
import { OpenTelemetryLogger } from '../openTelemetryLogger';
import { SpanContext } from '@opentelemetry/api';
import { MS0 } from './services/ms0';
import { MS1 } from './services/ms1';
import { MS2 } from './services/ms2';
import { MS3 } from './services/ms3';
const broker = new InMemoryBroker();

const logger = loggerFactory.use('somme');
// const childrenSpan = sinon.stub(logger['transport'], 'childrenSpan');
// const addLogStub = sinon.stub(logger, 'addLog') as unknown as SinonStub<[LogType, string, { key: string; }], void>;



let callStack: string[] = []

const loggerCall = sinon.stub(logger, 'span').callsFake((text: string, father?: SpanContext | undefined): any => {
  callStack.push(`${text}.${JSON.stringify(father)}`)
  console.log(callStack)
})

const fakeSpan = (text: string, father?: SpanContext | undefined): any => {
  callStack.push(`${text}.${JSON.stringify(father)}`)
  console.log(callStack)
}

describe('Logger', () => {

  let log1 = loggerFactory.use('ms1')
  let log2 = loggerFactory.use('ms2')
  let log3 = loggerFactory.use('ms3')

  beforeEach(() => {
    const log1stab = sinon.stub(log1, 'span').callsFake(fakeSpan)
    const log1stab2 = sinon.stub(log2, 'span').callsFake(fakeSpan)
    const log1stab3 = sinon.stub(log3, 'span').callsFake(fakeSpan)
  })

  before(async () => {

    const ms0 = new MS0();
    await Microservice.createFromClass(broker, ms0)
    const ms1 = new MS1();
    await Microservice.createFromClass(broker, ms1);
    const ms2 = new MS2();
    await Microservice.createFromClass(broker, ms2);
    const ms3 = new MS3();
    await Microservice.createFromClass(broker, ms3);
  })

  afterEach(() => {
    sinon.reset()
    callStack = []
  });

  it('Got callstack', async () => {
    await broker.send({
      microservice: 'ms1', method: 'algo'
    }, 'somme data')

    await broker.send({
      microservice: 'ms2', method: 'algo',
    }, 'somme data', { headers: [['headerKey', 'headerValue']] })

  })

});
