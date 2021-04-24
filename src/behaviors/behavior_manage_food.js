import { Entity, SimSpace, Behavior } from 'yi-js-engine'
import * as Victor from 'victor'

let target_food = 5;

let behavior_manage_food = new Behavior('manage_food', (entity, sim_space, parameters, memory, context) => {
    let remaining_foods = sim_space.get_entities_with_tag('food')
    let food_spawners = sim_space.get_entities_with_tag('food_spawner')
    if (remaining_foods.length + food_spawners.length >= target_food) { return false; }
    
    let spawner = new Entity(Victor(0, 0), ['food_spawner']);
    world_space.add_entity(spawner);
    world_space.entity_add_event_listener(spawner, 'update', 'spawn_food', {});
}, {});