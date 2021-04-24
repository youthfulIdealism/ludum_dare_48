import { Entity, SimSpace, Behavior } from 'yi-js-engine'
import * as Victor from 'victor'

let chase_player = new Behavior('goblin', (entity, sim_space, parameters, memory, context) => {
    let player = sim_space.get_entities_with_tag('player')[0];
    let speed = parameters.speed ? parameters.speed : 3;
    let tpf = context.tpf;

    let direction = player.location.clone().subtract(entity.location).normalize().multiply(Victor(speed, speed)).multiply(Victor(tpf, tpf));
    entity.location.add(direction);
});