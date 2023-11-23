import {
  microservice, method, Request, Response,
  z,
} from 'nats-micro';

import { loggerFactory } from '../../loggerFactory';

export const log = loggerFactory.use('ms2');

const IRequest = z.object({
  algo: z.string(),
})

type Req = z.infer<typeof IRequest>

@microservice({
  name: 'ms2',
  version: '0.0.1',
  description: 'Distributed logging test',
})
export class MS2 {
  // public microservice: Microservice | undefined;

  @method({
    request: z.string(),
    response: z.string(),
  })
  algo(req: Request<string>, res: Response<string>) {
    console.log('ms2')
    res.send('response from ms2')
    // broker.send({
    //   microservice: 'ms3',
    //   method: 'algo'
    // },
    //   ' {},,',
    //   {
    //     headers:
    //       [['X-LOG-SPAN-ID', JSON.stringify(log.id)]],
    //   })
    // const logger = loggerFactory.use(req.handler.microservice)
    // const noseque = logger.span('algo', req.headers)
    // noseque.end()
    return 'response from ms2'
  }
}
