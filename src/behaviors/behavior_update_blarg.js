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
        for (let enemy of enemies) {
            if (damage_check_location.distance(enemy.location) < 40) {
                is_blocked = true;
                let actual_block_distance = start_loc.distance(enemy.location);
                entity.render_data['mask-renderer-bg'].scale_y = actual_block_distance / (1920 / 2);

                //deal damage
                if (is_damage_tick) {
                    if (enemy.memory.armor === undefined || parameters.size >= enemy.memory.armor) {
                        enemy.memory.health--;
                    }

                    if (enemy.memory.health <= 0) {
                        sim_space.remove_entity(enemy);


                        if (enemy.tags.includes('small')) {
                            let sound = sim_space.asset_manager.get_sound('./assets/sounds/monster_pop_small.wav');
                            sound.play();
                        } else if (enemy.tags.includes('big')) {
                            let sound = sim_space.asset_manager.get_sound('./assets/sounds/monster_pop_big.wav');
                            sound.play();
                        } else {
                            let sound = sim_space.asset_manager.get_sound('./assets/sounds/monster_pop_medium.wav');
                            sound.play();
                        }
                    }
                    
                }
            }
        }
        if (is_blocked) {

            for (let q = 0; q < 4; q++) {
                let particle = new Entity(damage_check_location.clone(), []);
                world_space.add_entity(particle);
                world_space.entity_add_event_listener(particle, 'update', 'particle', {
                    'renderer': 'mask-renderer-bg',
                    'start_scale': .7,
                    'end_scale': .4,
                    'start_opacity': 1,
                    'end_opacity': 1,
                    'start_rotation': 0,
                    'end_rotation': 30 * (Math.random() > .5 ? 1 : -1) * Math.random(),
                    'direction': damage_check_adder.clone().normalize().multiply(Victor(-1, -1)).rotateBy((Math.random() - .5) * 2),
                    'velocity': 7,
                    'acceleration': 1 - .07,
                    'duration': 25 + Math.random() * 50,
                });
                particle.render_data['mask-renderer-bg'] = { image: './assets/triangle_particle.png' };
            }
            break;
        }

        damage_check_location.add(damage_check_adder)
    }

}, {});
