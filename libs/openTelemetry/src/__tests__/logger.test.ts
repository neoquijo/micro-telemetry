import { expect } from 'chai';
import sinon, { SinonStub } from 'sinon';

// import { Logger } from '../logger';
import { LogType } from '../logger';
import { loggerFactory } from '../loggerFactory';
import { OpenTelemetryLogger } from '../openTelemetryLogger';

const logger = loggerFactory.use('somme');
const childrenSpan = sinon.stub(logger['transport'], 'childrenSpan');
const addLogStub = sinon.stub(logger, 'addLog') as unknown as SinonStub<[LogType, string, { key: string; }], void>;

describe('Logger', () => {

  afterEach(() => sinon.reset());

  it('should create a Logger instance with the correct OpenTelemetryLogger', () => {
    expect(logger['transport']).to.be.instanceOf(OpenTelemetryLogger);
  });

  it('should have an empty childrens array', () => {
    expect(logger['childrens']).to.be.an('array').that.is.empty;
  });

  it('should contain a non empty childrens array', () => {
    logger.span('algo');
    logger.span('algomas');
    expect(logger['childrens']).to.be.an('array').that.lengthOf(2);
  });

  it('should have log methods with the correct levels', () => {
    const logLevels = [
      'error',
      'info',
      'warn',
      'debug',
      'silly',
      'verbose',
    ];
    logLevels.forEach((level) => {
      expect(logger['log']).to.have.property(level).that.is.a('function');
    });
  });

  it('should call childrenSpan when span method is called', () => {
    logger.span('test');
    sinon.assert.calledWith(childrenSpan, 'test', undefined);
  });

  it('should call addLog for all log levels with specific arguments', () => {
    const logLevels: LogType[] = [
      'warn',
      'silly',
      'debug',
      'info',
      'verbose',
    ];

    for (const level of logLevels) {
      logger[level](`${level} message`, { key: 'value' });
      sinon.assert.calledWith(addLogStub, level, `${level} message`, { key: 'value' });
    }
  });

  it('should call addLog for the error log level with specific arguments', () => {
    const errorSpan = 'Error span name';
    const error = new Error('Error message');
    logger.error(errorSpan, error, { key: 'value' });

    sinon.assert.calledWith(
      addLogStub,
      'error',
      sinon.match((value) => value.includes(errorSpan) && value.includes(error.toString())),
      sinon.match({
        error: error.toString(),
        key: 'value',
      }),
    );
  });

  it('should call end on children spans and end the main span', () => {
    const childSpan1 = logger.span('childSpan1');
    const childSpan2 = logger.span('childSpan2');
    const endChildSpan1Stub = sinon.stub(childSpan1, 'end');
    const endChildSpan2Stub = sinon.stub(childSpan2, 'end');
    logger.end();
    sinon.assert.calledOnce(endChildSpan1Stub);
    sinon.assert.calledOnce(endChildSpan2Stub);
    expect(logger['isOpen']).to.be.false;
  });

  it('should throw an error when end method is called without an open span', () => {
    const errorMessage = 'Span is already closed';
    logger.span('span');
    logger.end();
    logger.span('somme');
  });

  it('should throw an error when isOpen is false, wheen .end() is called', () => {
    logger.span('algo');
    logger.end();
    logger.span('algomas');
    const callValidateIsOpen = () => logger['validateIsOpen']();
    expect(callValidateIsOpen).to.throw('Span is already closed');
  });

  it('should create diferent instances of logger, and use existing ones', () => {
    const logger1 = loggerFactory.use('same');
    const logger2 = loggerFactory.use('same');
    const logger3 = loggerFactory.use('diferent');

    expect(logger1).to.not.equal(logger3);
    expect(logger1).to.equal(logger2);
  });

  it('should call the transport X times for logger instances with the same name', () => {
    const name = 'sharedName';
    const logger1 = loggerFactory.use(name);
    const logger2 = loggerFactory.use(name);
    const logger3 = loggerFactory.use('algo');

    const transportStub = sinon.stub(logger1['transport'], 'childrenSpan');
    const neverCalledTransportStub = sinon.stub(logger3['transport'], 'childrenSpan');

    logger1.span('span1');
    logger2.span('span2');

    sinon.assert.calledTwice(transportStub);
    sinon.assert.calledWith(transportStub, 'span1');
    sinon.assert.calledWith(transportStub, 'span2');
    sinon.assert.notCalled(neverCalledTransportStub);
    expect(logger1['transport'].name).to.equal('sharedName');
  });

});
