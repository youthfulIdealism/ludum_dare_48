import { Entity, SimSpace, Behavior } from 'yi-js-engine'
import * as Victor from 'victor'

let current_wave_index = 0;
let waves = [
    {
        goblins: 3
    },
    {
        goblins: 4,
        big_goblins: 1
    },
    {
        goblins: 4,
        big_goblins: 4
    },
]


let behavior_bell = new Behavior('bell', (entity, sim_space, parameters, memory, context) => {
    let remaining_enemies = sim_space.get_entities_with_tag('enemy')
    let enemy_spawners = sim_space.get_entities_with_tag('enemy_spawner')
    if (remaining_enemies.length > 0) { return false; }
    if (enemy_spawners.length > 0) { return false; }
    if (current_wave_index >= waves.length) { return false; }
    let current_wave = waves[current_wave_index];
   
    if (current_wave.goblins) {
        for (let q = 0; q < current_wave.goblins; q++) {
            let spawner = new Entity(Victor(0, 0), ['enemy_spawner']);
            world_space.add_entity(spawner);
            world_space.entity_add_event_listener(spawner, 'update', 'spawn_goblin', {});
        }
    }

    if (current_wave.big_goblins) {
        for (let q = 0; q < current_wave.big_goblins; q++) {
            let spawner = new Entity(Victor(0, 0), ['enemy_spawner']);
            world_space.add_entity(spawner);
            world_space.entity_add_event_listener(spawner, 'update', 'spawn_big_goblin', {});
        }
    }

    current_wave_index++;
}, {});