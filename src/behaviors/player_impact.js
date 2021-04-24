import { Entity, SimSpace, Behavior } from 'yi-js-engine'
import * as Victor from 'victor'

let check_player_impact = new Behavior('check_player_impact', (entity, sim_space, parameters, memory, context) => {
    let players = sim_space.get_entities_with_tag('player')
    for (let player of players) {
        let distance = player.location.distance(entity.location);
        if (distance < player.memory.width || entity.memory.width && distance < entity.memory.width) {
            sim_space.fire_event('collide', { entities: [entity, player] })
        }
    }
    return false;
});