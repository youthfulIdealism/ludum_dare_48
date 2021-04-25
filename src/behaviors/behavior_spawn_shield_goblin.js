import { Entity, SimSpace, Behavior } from 'yi-js-engine'
import * as Victor from 'victor'

let spawn_goblin_time = 50;

let spawn_shield_goblin = new Behavior('spawn_shield_goblin', (entity, sim_space, parameters, memory, context) => {
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

        let shield_goblin = new Entity(parameters.location, ['goblin', 'enemy', 'big']);
        world_space.add_entity(shield_goblin);
        shield_goblin.memory.health = 3;
        shield_goblin.memory.max_health = 3;
        shield_goblin.memory.armor = 3;
        shield_goblin.memory.state = 'chase';
        shield_goblin.memory.animations = {
            run: {
                frames: [
                    {
                        image: "./assets/shield_goblin_walk_0.png",
                        duration: 1
                    },
                    {
                        image: "./assets/shield_goblin_walk_1.png",
                        duration: 1
                    },
                    {
                        image: "./assets/shield_goblin_walk_2.png",
                        duration: 1
                    },
                    {
                        image: "./assets/shield_goblin_walk_3.png",
                        duration: 1
                    },
                    {
                        image: "./assets/shield_goblin_walk_4.png",
                        duration: 1
                    },
                    {
                        image: "./assets/shield_goblin_walk_5.png",
                        duration: 1
                    },
                ],
                type: 'loop',
            },
        }
        shield_goblin.memory.animation = shield_goblin.memory.animations.run;
        shield_goblin.render_data['render-animation'] = { };
        shield_goblin.render_data['render-health-bar'] = {};
        shield_goblin.render_data['render_shadow'] = { image: './assets/shadow.png', opacity: .3, scale: .5, offset_y: 25 };
        world_space.entity_add_event_listener(shield_goblin, 'update', 'shield_goblin', {});
        world_space.entity_add_event_listener(shield_goblin, 'update', 'check_player_impact', {});

        let crack = new Entity(parameters.location.clone(), []);
        world_space.add_entity(crack);
        let crack_config = {
            'renderer': 'render-decals',
            'start_scale': 1,
            'end_scale': 1,
            'start_opacity': 1,
            'end_opacity': 1,
            'start_rotation': 0,
            'end_rotation': 0,
            'direction': Victor(1, 0),
            'velocity': 0,
            'acceleration': 0,
            'duration': .001,
        };
        world_space.entity_add_event_listener(crack, 'update', 'particle', crack_config);
        crack.render_data['render-decals'] = { image: './assets/eruption_site.png', scale: crack_config.start_scale, opacity: crack_config.start_opacity };
    }

}, {});

/*
window.valid_min_x = 1800 - 1080 / 2;
window.valid_min_y = 1800 - 1080 / 2;
window.valid_max_x = 1800 + 1080 / 2;
window.valid_max_y = 1800 + 1080 / 2;
 * */