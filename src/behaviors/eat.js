import { Entity, SimSpace, Behavior } from 'yi-js-engine'
import * as Victor from 'victor'

let behavior_eat = new Behavior('eat', (entity, sim_space, parameters, memory, context) => {
    let collision = context.entities;
    let food = context.entities.find(ele => ele.tags.includes('food'));
    if (food) {
        sim_space.remove_entity(food)
        entity.memory.size = Math.min(entity.memory.size + parameters.amount, 3);
        entity.memory.animation = entity.memory.animations[`idle_${entity.memory.size}`];
        console.log(`idle_${entity.memory.size}`)
        console.log(entity.memory.animations[`idle_${entity.memory.size}`])
        entity.event_listeners.update.wasd.speed = window.player_speed_settings[entity.memory.size]
        entity.memory.animation_progress = 0;
    }
});