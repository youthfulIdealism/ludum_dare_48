import { Entity, SimSpace, Behavior } from 'yi-js-engine'
import * as Victor from 'victor'

const goblin_charge_distance = 100;
const goblin_amp_time = 10;
const goblin_charge_time = 50;
const goblin_charge_speed = 8;

let shield_goblin = new Behavior('shield_goblin', (entity, sim_space, parameters, memory, context) => {
    let player = sim_space.get_entities_with_tag('player')[0];
    let spitters = sim_space.get_entities_with_tag('spitter');
    let spawners = sim_space.get_entities_with_tag('enemy_spawner');
    let speed = parameters.speed ? parameters.speed : 5;
    let tpf = context.tpf;

    if (spitters.length == 0 && spawners.length == 0) {
        world_space.entity_add_event_listener(entity, 'update', 'goblin', {});
        delete entity.event_listeners['update'].shield_goblin;
        return;
    }

    if (spitters.length == 0) { return; }

    let closest_dist = entity.location.distance(spitters[0].location);
    let closest_spitter = spitters[0];
    for (let spitter of spitters) {
        let distance = entity.location.distance(spitter.location);

        if (distance < closest_dist) {
            closest_dist = distance;
            closest_spitter = spitter;
        }
    }

    let target = closest_spitter.location.clone().add(player.location.clone().subtract(closest_spitter.location).multiply(Victor(.25, .25)));
    let direction = target.clone().subtract(entity.location).normalize().multiply(Victor(speed, speed)).multiply(Victor(tpf, tpf));
    entity.location.add(direction);

   
});