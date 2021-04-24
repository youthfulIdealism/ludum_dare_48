import { Entity, SimSpace, Behavior } from 'yi-js-engine'
import * as Victor from 'victor'

const goblin_charge_distance = 100;
const goblin_amp_time = 10;
const goblin_charge_time = 50;
const goblin_charge_speed = 8;

let goblin = new Behavior('goblin', (entity, sim_space, parameters, memory, context) => {
    let player = sim_space.get_entities_with_tag('player')[0];
    let speed = parameters.speed ? parameters.speed : 3;
    let tpf = context.tpf;

    let state = entity.memory.state;
    if (state === 'chase') {
        let distance = player.location.distance(entity.location);
        if (distance > goblin_charge_distance) {
            let direction = player.location.clone().subtract(entity.location).normalize().multiply(Victor(speed, speed)).multiply(Victor(tpf, tpf));
            entity.location.add(direction);
        } else {
            let direction = player.location.clone().subtract(entity.location).normalize().multiply(Victor(speed, speed)).multiply(Victor(tpf, tpf));
            entity.memory.state = 'amp';
            parameters.current_amp_time = 0;
            parameters.charge_direction = direction.clone();

            let particle_attack_circle = new Entity(entity.location.clone(), []);
            world_space.add_entity(particle_attack_circle);
            world_space.entity_add_event_listener(particle_attack_circle, 'update', 'particle', {
                'renderer': 'attack-renderer',
                'start_scale': .8,
                'end_scale': .6,
                'start_opacity': 1,
                'end_opacity': 1,
                'start_rotation': 0,
                'end_rotation': 0,
                'duration': goblin_amp_time * 3,
            });
            particle_attack_circle.render_data['attack-renderer'] = { image: './assets/particle_attack_circle.png' };
        }
    }
    else if (state === 'amp') {
        parameters.current_amp_time += tpf;if (parameters.current_amp_time > goblin_amp_time) {
            entity.memory.state = 'charge'
            parameters.charge_time = 0;
        }

        let particle_amp = new Entity(entity.location.clone().add(Victor((Math.random() - .5) * 20), 0), []);
        world_space.add_entity(particle_amp);
        world_space.entity_add_event_listener(particle_amp, 'update', 'particle', {
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
        particle_amp.render_data['attack-renderer'] = { image: './assets/triangle_particle.png', 'scale': .4 };
    } else if (state === 'charge') {
        let direction = parameters.charge_direction.clone().normalize().multiply(Victor(goblin_charge_speed, goblin_charge_speed)).multiply(Victor(tpf, tpf));
        entity.location.add(direction);
        parameters.charge_time += tpf;
        if (parameters.charge_time > goblin_charge_time) { entity.memory.state = 'chase' }

        if (Math.random() < .2) {
            let particle_dust = new Entity(entity.location.clone().add(Victor(0, 20), []));
            world_space.add_entity(particle_dust);
            world_space.entity_add_event_listener(particle_dust, 'update', 'particle', {
                'renderer': 'image-renderer',
                'start_scale': .3,
                'end_scale': 1,
                'start_opacity': .3,
                'end_opacity': .05,
                'duration': 30 + Math.random() * 20,
                'direction': Victor(0, -1),
                'velocity': (1 + Math.random()) * .1,
            });
            particle_dust.render_data['image-renderer'] = { image: './assets/particle_dust.png', scale: .3, opacity: .3 };
        }
        
    }
   
});