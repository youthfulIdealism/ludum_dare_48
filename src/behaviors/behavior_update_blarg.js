import { Entity, SimSpace, Behavior } from 'yi-js-engine'
import * as Victor from 'victor'

const damage_tick_frequency = 10;
let scale_accum = 0;

let blarg_sound;

let behavior_update_blarg = new Behavior('update_blarg', (entity, sim_space, parameters, memory, context) => {
    if (!sim_space.input_manager) { return; }

    if (!blarg_sound) {
        blarg_sound = sim_space.asset_manager.get_sound('./assets/sounds/blarg.wav');
        blarg_sound.play();
    }

    //get mouse location
    let input_manager = sim_space.input_manager;
    let mouse_location = input_manager.mouse.location;
    let world_location = window.camera.screen_location_to_world_location(window.canvas, mouse_location.clone()).clone();

    //move the blarg endpoint towards the mouse
    let target_location = parameters.target_location ? parameters.target_location : world_location.clone();
    target_location.mix(world_location, .01);
    parameters.target_location = target_location;


    let player = sim_space.get_entities_with_tag('player')[0];
    let enemies = sim_space.get_entities_with_tag('enemy');
    let tpf = context.tpf;
    scale_accum += tpf;

    //generate render direction
    let start_loc = player.location.clone().add(Victor(0, -15));
    let direction = target_location.clone().subtract(start_loc).normalize();
    entity.location = start_loc;
    entity.render_data['mask-renderer-bg'].rotation = direction.angle() - (Math.PI / 2) * 3;
    entity.render_data['mask-renderer-bg'].scale_x = (parameters.size / 4) + (1 + Math.sin(scale_accum * .5)) * .05;
    if (parameters.size == 1) { entity.render_data['mask-renderer-bg'].scale_x *= .5}
    entity.render_data['mask-renderer-bg'].scale_y = 1;

    //keep player from moving very fast
    player.event_listeners.update.wasd.speed = 2;

    //player knockback
    let potential_location = player.location.clone().add(direction.clone().normalize().multiply(Victor(-tpf, -tpf)).multiply(Victor(4.5 * parameters.size, 4.5 * parameters.size)))
    if (window.in_bounds(potential_location)) {
        player.location = potential_location;
    }

    //tick down until damage time
    if (parameters.time_until_damage_tick === undefined) { parameters.time_until_damage_tick = 0; }
    if (parameters.damage_ticks_remaining === undefined) { parameters.damage_ticks_remaining = parameters.size; }
    parameters.time_until_damage_tick -= tpf;
    let is_damage_tick = parameters.time_until_damage_tick <= 0;

    if (is_damage_tick) {
        parameters.time_until_damage_tick = damage_tick_frequency;
        parameters.damage_ticks_remaining--;
        if (parameters.damage_ticks_remaining < 0) {
            //stop the blarg
            sim_space.remove_entity(entity);
            blarg_sound.pause()
            blarg_sound.currentTime = 0;
            blarg_sound = undefined;

            //reset the player size
            player.event_listeners.update.wasd.speed = window.player_speed_settings[0];
            player.memory.size = 0;
            player.memory.animation = player.memory.animations[`idle_${player.memory.size}`];
        }
    }

    window.shake.shake(600 * (parameters.size / 4), 1);

    let damage_check_location = start_loc.clone();
    let damage_check_interval = 30;
    let damage_check_adder = direction.clone().multiply(Victor(damage_check_interval, damage_check_interval));
    for (let q = 0; q < 1920 / 2; q += damage_check_interval) {
        let is_blocked = false;
        let block_armor = 0;
        for (let enemy of enemies) {
            if (damage_check_location.distance(enemy.location) < 40) {
                is_blocked = true;
                block_armor = enemy.memory.armor ? Math.max(enemy.memory.armor, block_armor) : block_armor;
                let actual_block_distance = start_loc.distance(enemy.location);
                entity.render_data['mask-renderer-bg'].scale_y = actual_block_distance / (1920 / 2);

                //deal damage
                if (is_damage_tick) {
                    if (enemy.memory.armor === undefined || parameters.size >= enemy.memory.armor) {
                        enemy.memory.health--;
                    }

                    if (enemy.memory.health <= 0) {
                        sim_space.remove_entity(enemy);

                        let ichor_size = 0;
                        if (enemy.tags.includes('small')) {
                            let sound = sim_space.asset_manager.get_sound('./assets/sounds/monster_pop_small.wav');
                            sound.play();
                        } else if (enemy.tags.includes('big')) {
                            let sound = sim_space.asset_manager.get_sound('./assets/sounds/monster_pop_big.wav');
                            sound.play();
                            ichor_size = 2;
                        } else {
                            let sound = sim_space.asset_manager.get_sound('./assets/sounds/monster_pop_medium.wav');
                            sound.play();
                            ichor_size = 1;
                        }


                        let flash = new Entity(enemy.location.clone(), []);
                        world_space.add_entity(flash);
                        let flash_config = {
                            'renderer': 'image-renderer',
                            'start_scale': 1.5,
                            'end_scale': .8,
                            'start_opacity': 1,
                            'end_opacity': .1,
                            'start_rotation': 0,
                            'end_rotation': 0,
                            'direction': Victor(1, 0),
                            'velocity': 0,
                            'acceleration': 0,
                            'duration': 5 + Math.random() * 10,
                        };
                        world_space.entity_add_event_listener(flash, 'update', 'particle', flash_config);
                        flash.render_data['image-renderer'] = { image: './assets/particle_flash.png', scale: flash_config.start_scale, opacity: flash_config.start_opacity };

                        //permanent ichor marks
                        for (let w = 0; w < 10 + ichor_size * 4; w++) {
                            let ichor = new Entity(enemy.location.clone().add(Victor(Math.random() - .5, Math.random() - .5).multiply(Victor(ichor_size * 4, ichor_size * 4))), []);
                            world_space.add_entity(ichor);
                            let ichor_config = {
                                'renderer': 'render-decals',
                                'start_scale': .4 - Math.random() * .1 + ichor_size * .1,
                                'end_scale': .01,
                                'start_opacity': .4,
                                'end_opacity': .1,
                                'start_rotation': 0,
                                'end_rotation': 0,
                                //'direction': damage_check_adder.clone().normalize().add(Victor(Math.random() - .5 * 2, Math.random() - .5 * 2)),
                                'direction': Victor(Math.random() - .5, Math.random() - .5),
                                'velocity': 12,
                                'acceleration': 1 - .045,
                                'duration': 10 + Math.random() * 10 + ichor_size * 4,
                            };
                            world_space.entity_add_event_listener(ichor, 'update', 'particle', ichor_config);
                            ichor.render_data['render-decals'] = { image: './assets/ichor_particle.png', scale: ichor_config.start_scale, opacity: ichor_config.start_opacity };
                        }

                        //smoke
                        for (let w = 0; w < 10; w++) {
                            let random_rotation = Math.random() * Math.PI;
                            let particle_big_smoke = new Entity(enemy.location.clone().add(Victor((Math.random() - .5) * 30), 0), []);
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
                        }


                    }
                    
                }
            }
        }
        if (is_blocked) {

            for (let q = 0; q < 2; q++) {
                let particle = new Entity(damage_check_location.clone(), []);
                world_space.add_entity(particle);
                world_space.entity_add_event_listener(particle, 'update', 'particle', {
                    'renderer': 'mask-renderer-bg',
                    'start_scale': .4 * parameters.size,
                    'end_scale': .1 * parameters.size,
                    'start_opacity': 1,
                    'end_opacity': 1,
                    'start_rotation': 0,
                    'end_rotation': 6.28 * (Math.random() > .5 ? 1 : -1) * (.5 + Math.random() * .5),
                    'direction': damage_check_adder.clone().normalize().multiply(Victor(-1, -1)).add(Victor(Math.random() - .5, Math.random() - .5)),
                    'velocity': 5,
                    'acceleration': 1 - .07,
                    'duration': 20 + Math.random() * 25,
                });
                particle.render_data['mask-renderer-bg'] = { image: './assets/triangle_particle_soft.png' };
            }

            if (Math.random() < .1) {
                let floor_mark = new Entity(damage_check_location.clone(), []);
                world_space.add_entity(floor_mark);
                let floor_mark_config = {
                    'renderer': 'render-decals',
                    'start_scale': 1,
                    'end_scale': 1,
                    'start_opacity': .01,
                    'end_opacity': .001,
                    'start_rotation': direction.angle(),
                    'end_rotation': direction.angle(),
                    'direction': Victor(1, 0),
                    'velocity': 0,
                    'acceleration': 0,
                    'duration': 0,
                };
                world_space.entity_add_event_listener(floor_mark, 'update', 'particle', floor_mark_config);
                floor_mark.render_data['render-decals'] = { image: './assets/blarg_mark.png', scale: floor_mark_config.start_scale, opacity: floor_mark_config.start_opacity, rotation: floor_mark_config.start_rotation };
            }

            if (block_armor > parameters.size) {
                let spark = new Entity(damage_check_location.clone(), []);
                world_space.add_entity(spark);
                let spark_config = {
                    'renderer': 'mask-renderer-bg',
                    'start_scale': 1,
                    'end_scale': .7,
                    'start_opacity': 1,
                    'end_opacity': .4,
                    'start_rotation': direction.angle(),
                    'end_rotation': direction.angle() + 3.14 * (Math.random() > .5 ? 1 : -1) * .5,
                    'direction': Victor(1, 0),
                    'velocity': 0,
                    'acceleration': 0,
                    'duration': 20,
                };
                world_space.entity_add_event_listener(spark, 'update', 'particle', spark_config);
                spark.render_data['mask-renderer-bg'] = { image: './assets/bounce_spark.png', scale: spark_config.start_scale, opacity: spark_config.start_opacity, rotation: spark_config.start_rotation };
            }
            
            break;
        }

        damage_check_location.add(damage_check_adder)
    }
    entity.render_data['render-decals'] = JSON.parse(JSON.stringify(entity.render_data['mask-renderer-bg']));
    entity.render_data['render-decals'].opacity = .01;
}, {});
