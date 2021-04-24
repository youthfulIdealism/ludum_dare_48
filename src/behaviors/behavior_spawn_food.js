import { Entity, SimSpace, Behavior } from 'yi-js-engine'
import * as Victor from 'victor'

let spawn_food_time = 50;

let spawn_food = new Behavior('spawn_food', (entity, sim_space, parameters, memory, context) => {
    if (!sim_space.input_manager) { return; }
    if (!parameters.spawn_food_time) { parameters.spawn_food_time = spawn_food_time; }
    if (!parameters.location) { parameters.location = Victor(1800 + (Math.random() - .5) * 1060, 1800 + (Math.random() - .5) * 1060) }
    parameters.spawn_food_time -= context.tpf;

    /*let particle_prep = new Entity(parameters.location.clone().add(Victor((Math.random() - .5) * 20), 0), []);
    world_space.add_entity(particle_prep);
    world_space.entity_add_event_listener(particle_prep, 'update', 'particle', {
        'renderer': 'attack-renderer',
        'start_scale': .4,
        'end_scale': .2,
        'start_opacity': 1,
        'end_opacity': 1,
        'start_rotation': Math.random() - .5,
        'end_rotation': (Math.random() - .5) * 3.14,
        'duration': 30 + Math.random() * 20,
        'direction': Victor(0, -1),
        'velocity': 1 + Math.random(),
    });
    particle_prep.render_data['attack-renderer'] = { image: './assets/triangle_particle.png', 'scale': .4 };*/

    if (parameters.spawn_food_time <= 0) {
        sim_space.remove_entity(entity);

        let food = new Entity(parameters.location, ['food']);
        world_space.add_entity(food);
        food.render_data['image-renderer'] = { image: './assets/food_0.png' };
        food.render_data['render_shadow'] = { image: './assets/shadow.png', opacity: .3, scale: .5, offset_y: 35 };
        world_space.entity_add_event_listener(food, 'update', 'check_player_impact', {});
        world_space.entity_add_event_listener(food, 'update', 'food_float', {});
    }

}, {});

/*
window.valid_min_x = 1800 - 1080 / 2;
window.valid_min_y = 1800 - 1080 / 2;
window.valid_max_x = 1800 + 1080 / 2;
window.valid_max_y = 1800 + 1080 / 2;
 * */