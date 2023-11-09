import {
  microservice, method, z, Microservice,
} from '../../../../libs/nats-micro-js2/src';
// import * as express from 'express'

@microservice({
  name: 'ms1',
  version: '0.0.1',
  description: 'Distributed logging test',
})
export class MS1 {
  public microservice: Microservice | undefined;

  @method<null, null>({ subject: 'test' })
  algo(data) {

    console.log(data)
    return { algo: 'response' }

  }
}