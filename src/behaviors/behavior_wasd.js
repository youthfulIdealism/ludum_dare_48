import { Entity, SimSpace, Behavior } from 'yi-js-engine'
import * as Victor from 'victor'

let behavior_wasd = new Behavior('wasd', (entity, sim_space, parameters, memory, context) => {
    if (!sim_space.input_manager) { return; }
    if (!parameters.speed) { parameters.speed = 1; }

    let tpf = context.tpf;
    let direction = Victor(0, 0);
    let is_moving = false;

    let input_manager = sim_space.input_manager;

    if (input_manager.is_key_down('w')) { is_moving = true; direction.add(Victor(0, -1)); }
    if (input_manager.is_key_down('s')) { is_moving = true; direction.add(Victor(0, 1)); }
    if (input_manager.is_key_down('a')) { is_moving = true; direction.add(Victor(-1, 0)); }
    if (input_manager.is_key_down('d')) { is_moving = true; direction.add(Victor(1, 0)); }

    if (is_moving) {
        entity.location.add(direction.normalize().multiply(Victor(tpf, tpf)).multiply(Victor(parameters.speed, parameters.speed)));
    }
    return false;

}, { 'speed': 'number' });

console.log('Loaded')