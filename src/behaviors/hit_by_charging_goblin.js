import { Entity, SimSpace, Behavior } from 'yi-js-engine'
import * as Victor from 'victor'



let behavior_hit_by_charging_goblin = new Behavior('hit_by_charging_goblin', (entity, sim_space, parameters, memory, context) => {
    let collision = context.entities;
    let goblin = context.entities.find(ele => ele.tags.includes('goblin'));
    if (goblin && goblin.memory.state === 'charge') {
        if (entity.memory.immune_time == undefined || entity.memory.immune_time <= 0) {
            entity.memory.health--;
            entity.memory.immune_time = window.player_immune_time;
            console.log('collide');
        }
    }
});