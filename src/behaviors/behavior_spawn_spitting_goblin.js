import { Entity, SimSpace, Behavior } from 'yi-js-engine'
import * as Victor from 'victor'

let spawn_goblin_time = 50;

let spawn_spitting_goblin = new Behavior('spawn_spitting_goblin', (entity, sim_space, parameters, memory, context) => {
    if (!sim_space.input_manager) { return; }
    if (!parameters.spawn_goblin_time) { parameters.spawn_goblin_time = spawn_goblin_time; }
    if (!parameters.location) { parameters.location = Victor(1800 + (Math.random() - .5) * 1060, 1800 + (Math.random() - .5) * 1060) }
    parameters.spawn_goblin_time -= context.tpf;

    let particle_prep = new Entity(parameters.location.clone().add(Victor((Math.random() - .5) * 20), 0), []);
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
    particle_prep.render_data['attack-renderer'] = { image: './assets/triangle_particle.png', 'scale': .4 };

    if (parameters.spawn_goblin_time <= 0) {
        sim_space.remove_entity(entity);

        let sound = sim_space.asset_manager.get_sound('./assets/sounds/spawn_squelch.wav');
        sound.play();

        let spitting_goblin = new Entity(parameters.location, ['goblin', 'enemy', 'small']);
        world_space.add_entity(spitting_goblin);
        spitting_goblin.memory.health = 1;
        spitting_goblin.memory.max_health = 1;
        spitting_goblin.memory.animations = {
            idle: {
                frames: [
                    {
                        image: "./assets/spitting_goblin_stand_0.png",
                        duration: 1
                    },
                    {
                        image: "./assets/spitting_goblin_stand_1.png",
                        duration: 1
                    },
                    {
                        image: "./assets/spitting_goblin_stand_2.png",
                        duration: 1
                    },
                    {
                        image: "./assets/spitting_goblin_stand_1.png",
                        duration: 1
                    },
                ],
                type: 'loop',
            },
        }
        spitting_goblin.memory.animation = spitting_goblin.memory.animations.idle;
        spitting_goblin.render_data['render-animation'] = { };
        spitting_goblin.render_data['render-health-bar'] = {};
        spitting_goblin.render_data['render_shadow'] = { image: './assets/shadow.png', opacity: .3, scale: .5, offset_y: 38 };
        world_space.entity_add_event_listener(spitting_goblin, 'update', 'spitting_goblin', {});
        world_space.entity_add_event_listener(spitting_goblin, 'update', 'check_player_impact', {});
    }

}, {});

/*
window.valid_min_x = 1800 - 1080 / 2;
window.valid_min_y = 1800 - 1080 / 2;
window.valid_max_x = 1800 + 1080 / 2;
window.valid_max_y = 1800 + 1080 / 2;
 * */