import { Entity, SimSpace, Behavior } from 'yi-js-engine'
import * as Victor from 'victor'

let behavior_click = new Behavior('click', (entity, sim_space, parameters, memory, context) => {
    if (!sim_space.input_manager) { return; }

    let input_manager = sim_space.input_manager;
    if (input_manager.mouse.mouse1.went_down) { sim_space.fire_event('click', {entity: entity}) }
});