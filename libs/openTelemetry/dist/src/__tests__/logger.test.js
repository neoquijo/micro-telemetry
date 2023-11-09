"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sinon_1 = __importDefault(require("sinon"));
const loggerFactory_1 = require("../loggerFactory");
const openTelemetryLogger_1 = require("../openTelemetryLogger");
const logger = loggerFactory_1.loggerFactory.use('somme');
const childrenSpan = sinon_1.default.stub(logger['transport'], 'childrenSpan');
const addLogStub = sinon_1.default.stub(logger, 'addLog');
describe('Logger', () => {
    afterEach(() => sinon_1.default.reset());
    it('should create a Logger instance with the correct OpenTelemetryLogger', () => {
        (0, chai_1.expect)(logger['transport']).to.be.instanceOf(openTelemetryLogger_1.OpenTelemetryLogger);
    });
    it('should have an empty childrens array', () => {
        (0, chai_1.expect)(logger['childrens']).to.be.an('array').that.is.empty;
    });
    it('should contain a non empty childrens array', () => {
        logger.span('algo');
        logger.span('algomas');
        (0, chai_1.expect)(logger['childrens']).to.be.an('array').that.lengthOf(2);
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
            (0, chai_1.expect)(logger['log']).to.have.property(level).that.is.a('function');
        });
    });
    it('should call childrenSpan when span method is called', () => {
        logger.span('test');
        sinon_1.default.assert.calledWith(childrenSpan, 'test', undefined);
    });
    it('should call addLog for all log levels with specific arguments', () => {
        const logLevels = [
            'warn',
            'silly',
            'debug',
            'info',
            'verbose',
        ];
        for (const level of logLevels) {
            logger[level](`${level} message`, { key: 'value' });
            sinon_1.default.assert.calledWith(addLogStub, level, `${level} message`, { key: 'value' });
        }
    });
    it('should call addLog for the error log level with specific arguments', () => {
        const errorSpan = 'Error span name';
        const error = new Error('Error message');
        logger.error(errorSpan, error, { key: 'value' });
        sinon_1.default.assert.calledWith(addLogStub, 'error', sinon_1.default.match((value) => value.includes(errorSpan) && value.includes(error.toString())), sinon_1.default.match({
            error: error.toString(),
            key: 'value',
        }));
    });
    it('should call end on children spans and end the main span', () => {
        const childSpan1 = logger.span('childSpan1');
        const childSpan2 = logger.span('childSpan2');
        const endChildSpan1Stub = sinon_1.default.stub(childSpan1, 'end');
        const endChildSpan2Stub = sinon_1.default.stub(childSpan2, 'end');
        logger.end();
        sinon_1.default.assert.calledOnce(endChildSpan1Stub);
        sinon_1.default.assert.calledOnce(endChildSpan2Stub);
        (0, chai_1.expect)(logger['isOpen']).to.be.false;
    });
    it('should throw an error when end method is called without an open span', () => {
        const errorMessage = 'Span is already closed';
        try {
            logger.span('span');
            logger.end();
            logger.span('somme');
        }
        catch (error) {
            (0, chai_1.expect)(error).to.be.an.instanceOf(Error);
            (0, chai_1.expect)(error.message).to.equal(errorMessage);
        }
    });
    it('should throw an error when isOpen is false', function () {
        logger['_isOpen'] = false;
        const callValidateIsOpen = () => logger['validateIsOpen']();
        (0, chai_1.expect)(callValidateIsOpen).to.throw('Span is already closed');
    });
    it('should throw an error when isOpen is false, wheen .end() is called', () => {
        try {
            logger.span('algo');
            logger.end();
            logger.span('algomas');
            const callValidateIsOpen = () => logger['validateIsOpen']();
            (0, chai_1.expect)(callValidateIsOpen).to.throw('Span is already closed');
        }
        catch (error) {
            (0, chai_1.expect)(error.message).to.equal('Span is already closed');
        }
    });
    it('should create diferent instances of logger, and use existing ones', () => {
        const logger1 = loggerFactory_1.loggerFactory.use('same');
        const logger2 = loggerFactory_1.loggerFactory.use('same');
        const logger3 = loggerFactory_1.loggerFactory.use('diferent');
        (0, chai_1.expect)(logger1).to.not.equal(logger3);
        (0, chai_1.expect)(logger1).to.equal(logger2);
    });
    it('should call the transport X times for logger instances with the same name', () => {
        const name = 'sharedName';
        const logger1 = loggerFactory_1.loggerFactory.use(name);
        const logger2 = loggerFactory_1.loggerFactory.use(name);
        const logger3 = loggerFactory_1.loggerFactory.use('algo');
        const transportStub = sinon_1.default.stub(logger1['transport'], 'childrenSpan');
        const neverCalledTransportStub = sinon_1.default.stub(logger3['transport'], 'childrenSpan');
        logger1.span('span1');
        logger2.span('span2');
        sinon_1.default.assert.calledTwice(transportStub);
        sinon_1.default.assert.calledWith(transportStub, 'span1');
        sinon_1.default.assert.calledWith(transportStub, 'span2');
        sinon_1.default.assert.notCalled(neverCalledTransportStub);
        (0, chai_1.expect)(logger1['transport'].name).to.equal('sharedName');
    });
});
