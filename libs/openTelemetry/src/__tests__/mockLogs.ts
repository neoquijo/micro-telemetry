import { LoggerFactory } from '../loggerFactory';
import { MockLogTransport } from './mockLogTransport';

export const transport = new MockLogTransport();

LoggerFactory.create(transport);

export const loggerFactory = LoggerFactory.inst;
