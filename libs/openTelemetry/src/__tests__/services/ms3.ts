import {
  microservice, method, Request, Response,
  z,
} from 'nats-micro';
import { broker } from './broker';
import { extractLogContextFromHeaders } from '../../logger';
import { loggerFactory } from '../../loggerFactory';



const IRequest = z.object({
  algo: z.string(),
})

type Req = z.infer<typeof IRequest>

@microservice({
  name: 'ms3',
  version: '0.0.1',
  description: 'Distributed logging test',
})
export class MS3 {
  // public microservice: Microservice | undefined;

  @method({
    request: z.string(),
    response: z.void(),
  })
  async algo(req: Request<string>, res: Response<void>) {
    const log = loggerFactory.use(req.handler.microservice);
    const noseque = log.span('ms3', extractLogContextFromHeaders(req.headers))
    console.log('ms3')
    await broker.send({
      microservice: 'ms1',
      method: 'algo'
    },
      ' {},,',
      {
        headers:
          [['X-LOG-SPAN-ID', JSON.stringify(noseque.id)]],
      })
    noseque.end();
  }
}
