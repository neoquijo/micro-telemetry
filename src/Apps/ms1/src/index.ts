import { InMemoryBroker, Microservice, NatsBroker } from 'nats-micro-js/src';
import { MS1 } from './ms1';



(async () => {

  const broker = new InMemoryBroker();

  // const broker = await new NatsBroker({
  //   servers: process.env.NATS_URL,
  // }).connect();

  const ms1 = new MS1();
  ms1.microservice = await Microservice.createFromClass(broker, ms1);
})()
  .catch(console.error);