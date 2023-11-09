import {
  microservice, method, Request, Response,
  z,
} from 'nats-micro';
import { broker } from './broker';
import { loggerFactory } from 'logs';

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
    response: z.void(),
  })
  algo(req: Request<string>, res: Response<void>) {

    console.log(`MS2.algo(${req.data})`);

    // res.send('algo');
  }
}