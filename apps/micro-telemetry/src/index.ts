import { Microservice } from 'nats-micro';
import { loggerFactory } from 'logs';

import { MS1 } from './ms1';
import { MS2 } from './ms2';
import { broker } from './broker';
import { MS0 } from './ms0';
import { MS3 } from './ms3';

(async () => {

  const ms0 = new MS0();
  await Microservice.createFromClass(broker, ms0)
  const ms1 = new MS1();
  await Microservice.createFromClass(broker, ms1);
  const ms2 = new MS2();
  await Microservice.createFromClass(broker, ms2);
  const ms3 = new MS3();
  await Microservice.createFromClass(broker, ms3)




  await broker.send({ microservice: 'ms0', method: 'algo', }, 'hello');


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

