import { InMemoryBroker, NatsBroker } from "nats-micro";

export const brokerInstance = new InMemoryBroker();
// export const brokerInstance = async () => await (new NatsBroker({
//     servers: process.env.NATS_URL,
// })).connect();
