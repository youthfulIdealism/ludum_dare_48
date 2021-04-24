import { Entity, SimSpace, Behavior } from 'yi-js-engine'
import * as Victor from 'victor'

let projectile = new Behavior('projectile', (entity, sim_space, parameters, memory, context) => {
    let range = parameters.range;
    let speed = parameters.speed;
    let direction = parameters.direction;
    let tpf = context.tpf;

    console.log(direction);

    parameters.range -= speed * tpf;
    entity.location.add(direction.clone().normalize().multiply(Victor(speed, speed)).multiply(Victor(tpf, tpf)));
    if (parameters.range <= 0) {
        sim_space.remove_entity(entity);
    }
});