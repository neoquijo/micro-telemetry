import { InMemoryBroker, Microservice, NatsBroker } from '../../../../libs/nats-micro-js2/src';
import { MS2 } from './ms2';



(async () => {

  const broker = new InMemoryBroker();

  // const broker = await new NatsBroker({
  //   servers: process.env.NATS_URL,
  // }).connect();

  const ms2 = new MS2();
  ms2.microservice = await Microservice.createFromClass(broker, ms2);
})()
  .catch(console.error);