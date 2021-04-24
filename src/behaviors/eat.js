import { Entity, SimSpace, Behavior } from 'yi-js-engine'
import * as Victor from 'victor'

let behavior_eat = new Behavior('eat', (entity, sim_space, parameters, memory, context) => {
    let collision = context.entities;
    let foods = context.entities.filter(ele => ele.tags.includes('food'));
    for (let food of foods) { sim_space.remove_entity(food); }
    entity.memory.size = Math.min(entity.memory.size + parameters.amount, 3);
    entity.memory.animation = entity.memory.animations[`idle_${entity.memory.size}`];
    console.log(`idle_${entity.memory.size}`)
    console.log(entity.memory.animations[`idle_${entity.memory.size}`])
    entity.event_listeners.update.wasd.speed = [16, 10, 5, 3][entity.memory.size]
    entity.memory.animation_progress = 0;
});