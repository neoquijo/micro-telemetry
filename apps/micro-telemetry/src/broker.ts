import { InMemoryBroker } from "nats-micro";

export const broker = new InMemoryBroker()
    // const broker = await new NatsBroker({
    //   servers: process.env.NATS_URL,
    // }).connect();
