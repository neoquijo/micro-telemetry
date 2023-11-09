import {
  microservice, method, z, Microservice
} from 'nats-micro-js/src'

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
  public microservice: Microservice | undefined;

  @method<unknown, any>({ subject: 'files.registerScriptLanguage' })
  async algo() {
    console.log('test')
  }

}