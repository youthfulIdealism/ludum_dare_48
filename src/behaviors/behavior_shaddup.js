import { Entity, SimSpace, Behavior } from 'yi-js-engine'
import * as Victor from 'victor'


let shaddup = new Behavior('shaddup', (entity, sim_space, parameters, memory, context) => {
    // this only exists to make certain console log events go away
}, {});