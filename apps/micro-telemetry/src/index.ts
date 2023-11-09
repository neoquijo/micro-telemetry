// import { loggerFactory } from "logs";
import { InMemoryBroker, Microservice } from 'nats-micro';
import { MS1 } from './ms1';
import { MS2 } from './ms2';
import { broker } from './broker';

(async () => {
  try {
    // const logger = loggerFactory.use('main')

    const ms1 = new MS1();
    await Microservice.createFromClass(broker, ms1);
    const ms2 = new MS2();
    await Microservice.createFromClass(broker, ms2);

    // logger.span('Main app');
    // logger.info('Куку')

    await broker.send({ microservice: 'ms1', method: 'algo' }, 'hello');

    await new Promise<void>((res) => {
      const int = setInterval(() => {
        if (ms1.finished) {
          clearInterval(int);
          res();
        }
      }
        ,
        100);
    });

    console.log('ok');
  } catch (error) {
    console.log(error);
  }
})();

`
trace
ms1: [algo]
ms1:   [1]
ms1:   [/1]
ms2:   [algo]
ms2:   [/algo]
ms1:   [2]
ms1:   [/2]
ms2:   [algo]
ms2:   [/algo]
ms1:   [3]
ms1:   [/3]
ms1: [/algo]
/trace
`

