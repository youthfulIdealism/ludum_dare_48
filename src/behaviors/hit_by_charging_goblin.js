import { Entity, SimSpace, Behavior } from 'yi-js-engine'
import * as Victor from 'victor'



let behavior_hit_by_charging_goblin = new Behavior('hit_by_charging_goblin', (entity, sim_space, parameters, memory, context) => {
    let collision = context.entities;
    let goblin = context.entities.find(ele => ele.tags.includes('goblin') || ele.tags.includes('projectile'));
    let projectile = context.entities.find(ele => ele.tags.includes('projectile'));
    if (goblin && goblin.memory.state === 'charge' || projectile) {
        if (entity.memory.immune_time == undefined || entity.memory.immune_time <= 0) {
            let sound = sim_space.asset_manager.get_sound('./assets/sounds/player_hit.wav');
            sound.play();

            entity.memory.health--;
            entity.memory.immune_time = window.player_immune_time;
        }
    }
});