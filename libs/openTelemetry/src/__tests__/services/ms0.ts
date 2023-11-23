import {
  microservice, method, Request, Response,
  z,
} from 'nats-micro';
import { loggerFactory } from '../../loggerFactory';
import { brokerInstance } from './broker';




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

  //@ts-ignore
  @method({
    request: z.string(),
    response: z.string(),
  })
  async algo(req: Request<string>, res: Response<string>) {
    const broker = await brokerInstance();
    const log = loggerFactory.use('ms0')
    console.log('ms0')
    const ms1call = await broker.request({
      microservice: 'ms1',
      method: 'algo'
    }, ' {},,',)
    console.log(ms1call)
    res.send('response')
  }
}