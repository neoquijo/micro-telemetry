import { LoggerFactory } from '../loggerFactory';
import { MockLogTransport } from './mockLogTransport';

LoggerFactory.create(new MockLogTransport());

export const loggerFactory = LoggerFactory.inst;
