import { Entity, SimSpace, Behavior } from 'yi-js-engine'
import * as Victor from 'victor'

const goblin_charge_distance = 100;
const goblin_amp_time = 10;
const goblin_charge_time = 50;
const goblin_charge_speed = 8;

let food_float = new Behavior('food_float', (entity, sim_space, parameters, memory, context) => {
    let tpf = context.tpf;
    if (!parameters.accum) {
        parameters.accum = 0;
    }
    parameters.accum += tpf;
    entity.render_data['image-renderer'].offset_y = Math.sin(parameters.accum * .3) * 5;

    if (Math.random() < .3) {
        let particle_sparkle = new Entity(entity.location.clone().add(Victor((Math.random() - .5) * 13, -8 + entity.render_data['image-renderer'].offset_y), []));
        world_space.add_entity(particle_sparkle);
        world_space.entity_add_event_listener(particle_sparkle, 'update', 'particle', {
            'renderer': 'image-renderer',
            'start_scale': 1,
            'end_scale': .1,
            'start_opacity': .5,
            'end_opacity': .01,
            'duration': 30 + Math.random() * 20,
            'direction': Victor(0, -1),
            'velocity': (1 + Math.random()) * .1,
        });
        particle_sparkle.render_data['image-renderer'] = { image: './assets/particle_sparkle.png', scale: .3, opacity: .3 };
    }
});