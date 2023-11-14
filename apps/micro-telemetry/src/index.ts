import { Microservice } from 'nats-micro';
import { loggerFactory } from 'logs';

import { MS1 } from './ms1';
import { MS2 } from './ms2';
import { broker } from './broker';

(async () => {
  const log = loggerFactory.use('service');
  const log2 = loggerFactory.use('service2');

  log.span('algo');
  const { span, ctx } = log.createContext('spanWithContext');
  const algo = log2.injectContext('somme', ctx);
  const nested = algo.span('noseque');
  const deeper = nested.span('dobleNest');
  deeper.info('deeper inside');
  algo.info('algo sub');

  try {

    const ms1 = new MS1();
    await Microservice.createFromClass(broker, ms1);
    const ms2 = new MS2();
    await Microservice.createFromClass(broker, ms2);

    await broker.send({ microservice: 'ms1', method: 'algo', }, 'hello', { headers: [['X-LOG-SPAN-ID', JSON.stringify(ctx)]] });
    algo.end();
    span.end();

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

