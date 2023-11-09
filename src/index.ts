import { loggerFactory } from "../libs/openTelemetry/src/loggerFactory";
import { InMemoryBroker, NatsBroker, } from 'nats-micro-js/src'

(async () => {
  try {
    const logger = loggerFactory.use('main')

    const broker = await new NatsBroker({
      servers: process.env.NATS_URL,
    }).connect();

    // const broker = new InMemoryBroker()
    broker.send('test', { 'algo': 'algomas' })
    logger.span('Main app');
    logger.info('Куку')
    console.log('ok')
  } catch (error) {
    console.log(error)
  }
})()
