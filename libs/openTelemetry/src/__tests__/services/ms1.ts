/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  microservice, method, Request, Response,
  z,
  Microservice,
} from 'nats-micro';
import { loggerFactory } from '../../loggerFactory';

const log = loggerFactory.use('ms1');
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
  async test1(req: Request<string>, res: Response<string>): Promise<void> {
    const log = mockFactory.use('ms1');
    log.span('ms1func');
    const somme = await mockRequest('ms2', 'test1', log.id);
    log.end();
    res.send('somme');
  }

  // @ts-ignore
  @method({
    request: z.string(),
    response: z.string(),
  })
  async test2(req: Request<string>, res: Response<string>): Promise<void> {
    const log = mockFactory.use('ms1');
    mockRequest('ms3', 'test2', log.id);
    mockRequest('ms2', 'test2', log.id);

    log.end();
    res.send('somme');

  }

}
