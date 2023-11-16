import {
  microservice, method, Request, Response,
  z,
} from 'nats-micro';
import { broker } from './broker';
import { loggerFactory } from '../../loggerFactory';


const IRequest = z.object({
  algo: z.string(),
})

type Req = z.infer<typeof IRequest>

@microservice({
  name: 'ms0',
  version: '0.0.1',
  description: 'Distributed logging test',
})
export class MS0 {
  // public microservice: Microservice | undefined;

  @method({
    request: z.string(),
    response: z.void(),
  })
  async algo(req: Request<string>, res: Response<void>) {
    const log = loggerFactory.use(req.handler.microservice);
    await broker.send({
      microservice: 'ms1',
      method: 'algo'
    },
      ' {},,',
      {
        headers:
          [['X-LOG-SPAN-ID', JSON.stringify(log.id)]],
      })

    broker.send({
      microservice: 'ms3',
      method: 'algo'
    },
      ' {},,',
      {
        headers:
          [['X-LOG-SPAN-ID', JSON.stringify(log.id)]],
      })

    log.end();
  }
}