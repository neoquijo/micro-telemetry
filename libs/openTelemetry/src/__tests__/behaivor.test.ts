import { InMemoryBroker, Microservice } from 'nats-micro';
import sinon from 'sinon';

// import { Logger } from '../logger';
import { MS0 } from './services/ms0';
import { MS1 } from './services/ms1';
import { MS2 } from './services/ms2';
import { MS3 } from './services/ms3';
import { callStack } from './callStack';
import { brokerInstance } from './services/broker';
import { expect } from 'chai';

const broker = brokerInstance;

describe('Logger', () => {

  before(async () => {

    const ms0 = new MS0();
    await Microservice.createFromClass(broker, ms0);
    const ms1 = new MS1();
    await Microservice.createFromClass(broker, ms1);
    const ms2 = new MS2();
    await Microservice.createFromClass(broker, ms2);
    const ms3 = new MS3();
    await Microservice.createFromClass(broker, ms3);
  });

  afterEach(() => {
    // Restore the original methods after each test
    sinon.restore();
  });

  it('Got callstack', async () => {
    await broker.send({
      microservice: 'ms1',
      method: 'algo',
    }, 'somme data', {
      headers: [
        [
          'algo',
          'algo',
        ],
      ],
    });

    console.log(JSON.stringify(callStack.spanTree));
    expect(callStack.getSpan('ms1').childrens.length).length.to.eq(1);
    expect(callStack.getSpan('ms1.func').father)

  });

});
