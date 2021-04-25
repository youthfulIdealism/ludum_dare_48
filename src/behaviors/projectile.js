import { Entity, SimSpace, Behavior } from 'yi-js-engine'
import * as Victor from 'victor'

let projectile = new Behavior('projectile', (entity, sim_space, parameters, memory, context) => {
    let range = parameters.range;
    let speed = parameters.speed;
    let direction = parameters.direction;
    let tpf = context.tpf;

    let random_rotation = Math.random() * Math.PI;
    let particle_soot = new Entity(entity.location.clone().add(Victor((Math.random() - .5) * 30), 0), []);
    world_space.add_entity(particle_soot);
    world_space.entity_add_event_listener(particle_soot, 'update', 'particle', {
        'renderer': 'image-renderer',
        'start_scale': .5,
        'end_scale': .2,
        'start_opacity': .9,
        'end_opacity': .5,
        'start_rotation': random_rotation,
        'end_rotation': random_rotation,
        'duration': 30 + Math.random() * 20,
        'direction': Victor(0, -1),
        'velocity': 1 - Math.random(),
    });
    particle_soot.render_data['image-renderer'] = { image: './assets/smoke_particle.png', 'scale': .4 };


    random_rotation = Math.random() * Math.PI;
    let particle_big_smoke = new Entity(entity.location.clone().add(Victor((Math.random() - .5) * 30), 0), []);
    world_space.add_entity(particle_big_smoke);
    world_space.entity_add_event_listener(particle_big_smoke, 'update', 'particle', {
        'renderer': 'image-renderer',
        'start_scale': .8,
        'end_scale': 1,
        'start_opacity': .5,
        'end_opacity': .2,
        'start_rotation': random_rotation,
        'end_rotation': random_rotation,
        'duration': 60 + Math.random() * 30,
        'direction': Victor(0, -1),
        'velocity': 1 - Math.random(),
    });
    particle_big_smoke.render_data['image-renderer'] = { image: './assets/smoke_particle.png', 'scale': .8 };

    if (Math.random() < .3) {
        let particle_ember = new Entity(entity.location.clone().add(Victor((Math.random() - .5) * 30), 0), []);
        world_space.add_entity(particle_ember);
        world_space.entity_add_event_listener(particle_ember, 'update', 'particle', {
            'renderer': 'image-renderer',
            'start_scale': 1,
            'end_scale': .3,
            'start_opacity': 1,
            'end_opacity': .2,
            'start_rotation': 0,
            'end_rotation': 0,
            'duration': 60 + Math.random() * 30,
            'direction': Victor(Math.random() - .5, Math.random() - .5),
            'velocity': 1 - Math.random(),
        });
        particle_ember.render_data['image-renderer'] = { image: './assets/particle_ember.png'};
    }
    

    if (!entity.render_data['image-renderer'].rotation) { entity.render_data['image-renderer'].rotation = 0}
    entity.render_data['image-renderer'].rotation += tpf * 1;

    parameters.range -= speed * tpf;
    entity.location.add(direction.clone().normalize().multiply(Victor(speed, speed)).multiply(Victor(tpf, tpf)));
    if (parameters.range <= 0) {
        sim_space.remove_entity(entity);
    }
});


