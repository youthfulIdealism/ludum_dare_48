import { Entity, SimSpace, Behavior } from 'yi-js-engine'
import * as Victor from 'victor'

let behavior_immune_time = new Behavior('immune_time', (entity, sim_space, parameters, memory, context) => {
    if (entity.memory.immune_time === undefined || Number.isNaN(entity.memory.immune_time)) { entity.memory.immune_time = 0; }
    entity.memory.immune_time -= context.tpf;
    console.log(entity.memory.immune_time - context.tpf)
}, {});